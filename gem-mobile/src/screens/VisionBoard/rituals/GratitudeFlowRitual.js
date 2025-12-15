/**
 * GratitudeFlowRitual - Dòng Chảy Biết Ơn
 * Vision Board 2.0 - Ritual với golden particles
 * Created: December 10, 2025
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  ScrollView,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import {
  ArrowLeft,
  Gift,
  Volume2,
  VolumeX,
  Check,
  Sparkles,
  Plus,
  X,
  Send,
} from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { completeRitual } from '../../../services/ritualService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GOLD_COLORS = {
  primary: '#FFD700',
  secondary: '#FFA500',
  light: '#FFF3B0',
  dark: '#B8860B',
};

// Golden Particle
const GoldenParticle = ({ delay, size = 8 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;

      const startX = (Math.random() - 0.5) * SCREEN_WIDTH * 0.8;
      const endX = startX + (Math.random() - 0.5) * 100;

      opacity.setValue(0);
      translateY.setValue(50);
      translateX.setValue(startX);
      scale.setValue(0);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -SCREEN_HEIGHT * 0.5, duration: 3000, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: endX, duration: 3000, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.5, duration: 3000, useNativeDriver: true }),
        ]),
      ]).start(() => {
        if (isMounted) animate();
      });
    };

    animate();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    />
  );
};

// Gratitude Item Component
const GratitudeItem = ({ text, index, onRemove }) => {
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.gratitudeItem,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Sparkles size={16} color={GOLD_COLORS.primary} />
      <Text style={styles.gratitudeText}>{text}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <X size={16} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const GratitudeFlowRitual = ({ navigation }) => {
  const { user } = useAuth();
  const [phase, setPhase] = useState('start'); // start, input, sending, completed
  const [gratitudes, setGratitudes] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [sound, setSound] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sendProgress = useRef(new Animated.Value(0)).current;

  // Load ambient sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound: audioSound } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/chime.mp3'),
          { isLooping: true, volume: 0.3 }
        );
        setSound(audioSound);
      } catch (err) {
        console.log('Sound not available');
      }
    };

    loadSound();

    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const startRitual = async () => {
    setPhase('input');
    Vibration.vibrate(100);

    if (sound && !isMuted) {
      await sound.playAsync();
    }
  };

  const addGratitude = () => {
    if (!currentInput.trim() || gratitudes.length >= 5) return;

    setGratitudes([...gratitudes, currentInput.trim()]);
    setCurrentInput('');
    Vibration.vibrate(50);
  };

  const removeGratitude = (index) => {
    setGratitudes(gratitudes.filter((_, i) => i !== index));
  };

  const sendGratitude = async () => {
    if (gratitudes.length === 0) return;

    setPhase('sending');

    // Animate sending
    Animated.timing(sendProgress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(async () => {
      setPhase('completed');
      Vibration.vibrate([0, 100, 50, 100, 50, 100]);

      if (sound) {
        await sound.stopAsync();
      }

      // Save completion
      if (user?.id) {
        try {
          await completeRitual(user.id, 'gratitude-flow', JSON.stringify(gratitudes));
        } catch (err) {
          console.error('Failed to save ritual:', err);
        }
      }
    });
  };

  const toggleMute = async () => {
    setIsMuted(!isMuted);
    if (sound) {
      if (isMuted) {
        await sound.playAsync();
      } else {
        await sound.pauseAsync();
      }
    }
  };

  return (
    <LinearGradient
      colors={['#1A1500', '#2D2500', '#4A3D00']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Dòng Chảy Biết Ơn</Text>
          <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
            {isMuted ? (
              <VolumeX size={24} color="#fff" />
            ) : (
              <Volume2 size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Particles Background */}
        {(phase === 'input' || phase === 'sending') && (
          <View style={styles.particlesContainer}>
            {Array.from({ length: 15 }).map((_, i) => (
              <GoldenParticle key={i} delay={i * 200} size={6 + Math.random() * 6} />
            ))}
          </View>
        )}

        {/* Main Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {phase === 'start' && (
            <View style={styles.startScreen}>
              <Gift size={80} color={GOLD_COLORS.primary} />
              <Text style={styles.subtitle}>Thu hút thêm nhiều phước lành</Text>
              <Text style={styles.description}>
                Viết ra những điều bạn biết ơn và gửi lên vũ trụ để thu hút thêm nhiều phước lành.
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={startRitual}>
                <Text style={styles.startButtonText}>Bắt đầu</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'input' && (
            <View style={styles.inputPhase}>
              <Text style={styles.inputTitle}>
                Viết ra những điều bạn biết ơn
              </Text>
              <Text style={styles.inputHint}>
                ({gratitudes.length}/5 điều)
              </Text>

              <ScrollView style={styles.gratitudeList} showsVerticalScrollIndicator={false}>
                {gratitudes.map((text, index) => (
                  <GratitudeItem
                    key={index}
                    text={text}
                    index={index}
                    onRemove={() => removeGratitude(index)}
                  />
                ))}
              </ScrollView>

              {gratitudes.length < 5 && (
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Tôi biết ơn vì..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={currentInput}
                    onChangeText={setCurrentInput}
                    onSubmitEditing={addGratitude}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={[styles.addButton, !currentInput.trim() && styles.addButtonDisabled]}
                    onPress={addGratitude}
                    disabled={!currentInput.trim()}
                  >
                    <Plus size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              {gratitudes.length > 0 && (
                <TouchableOpacity style={styles.sendButton} onPress={sendGratitude}>
                  <Text style={styles.sendButtonText}>Gửi vào vũ trụ</Text>
                  <Send size={20} color="#1A1500" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {phase === 'sending' && (
            <View style={styles.sendingPhase}>
              <View style={styles.sendingVisual}>
                {gratitudes.map((text, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.flyingGratitude,
                      {
                        opacity: sendProgress.interpolate({
                          inputRange: [0, 0.3 + index * 0.1, 0.5 + index * 0.1, 1],
                          outputRange: [1, 1, 0, 0],
                        }),
                        transform: [
                          {
                            translateY: sendProgress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [index * 60, -SCREEN_HEIGHT],
                            }),
                          },
                          {
                            scale: sendProgress.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [1, 0.8, 0.3],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Sparkles size={16} color={GOLD_COLORS.primary} />
                    <Text style={styles.flyingText}>{text}</Text>
                  </Animated.View>
                ))}
              </View>
              <Text style={styles.sendingText}>Đang gửi lòng biết ơn...</Text>
            </View>
          )}

          {phase === 'completed' && (
            <View style={styles.completionScreen}>
              <View style={styles.completionIcon}>
                <Check size={60} color="#4CAF50" />
              </View>
              <Text style={styles.completionTitle}>Tuyệt vời!</Text>
              <Text style={styles.completionText}>
                {gratitudes.length} lời biết ơn đã được gửi đến vũ trụ
              </Text>
              <View style={styles.xpBadge}>
                <Sparkles size={20} color={GOLD_COLORS.primary} />
                <Text style={styles.xpText}>+30 XP</Text>
              </View>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.doneButtonText}>Hoàn tất</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  muteButton: {
    padding: 8,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  particle: {
    position: 'absolute',
    backgroundColor: GOLD_COLORS.primary,
    borderRadius: 10,
    shadowColor: GOLD_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: 40,
  },
  startScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: GOLD_COLORS.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 32,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1500',
  },
  inputPhase: {
    flex: 1,
  },
  inputTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  inputHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  gratitudeList: {
    flex: 1,
    marginBottom: 16,
  },
  gratitudeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  gratitudeText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  removeButton: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  addButton: {
    backgroundColor: GOLD_COLORS.primary,
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GOLD_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 20,
    gap: 10,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1500',
  },
  sendingPhase: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendingVisual: {
    alignItems: 'center',
    width: '100%',
  },
  flyingGratitude: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  flyingText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  sendingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 32,
  },
  completionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76,175,80,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 24,
  },
  completionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
    textAlign: 'center',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
    gap: 8,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: GOLD_COLORS.primary,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 32,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default GratitudeFlowRitual;
