/**
 * PERSONALIZED GREETING COMPONENT
 * Displays personalized greeting with journey progress
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Sun, Moon, Sunrise, Sunset, Sparkles } from 'lucide-react-native';
import { userMemoryService } from '../../services/userMemoryService';

const PersonalizedGreeting = ({ userId, profile: propProfile, onLoad }) => {
  const [greeting, setGreeting] = useState('');
  const [profile, setProfile] = useState(propProfile);
  const [timeIcon, setTimeIcon] = useState('sun');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadGreeting();
  }, [userId, propProfile]);

  const loadGreeting = async () => {
    try {
      let userProfile = propProfile;

      if (!userProfile && userId) {
        userProfile = await userMemoryService.getUserProfile(userId);
        setProfile(userProfile);
      }

      // Generate greeting
      const greetingText = userMemoryService.buildPersonalizedGreeting(userProfile);
      setGreeting(greetingText);

      // Set time-based icon
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 8) {
        setTimeIcon('sunrise');
      } else if (hour >= 8 && hour < 17) {
        setTimeIcon('sun');
      } else if (hour >= 17 && hour < 20) {
        setTimeIcon('sunset');
      } else {
        setTimeIcon('moon');
      }

      // Animate in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      if (onLoad) {
        onLoad(userProfile);
      }
    } catch (error) {
      console.error('[PersonalizedGreeting] loadGreeting error:', error);
      setGreeting('Xin chào! GEM Master sẵn sàng hỗ trợ bạn.');
    }
  };

  const renderTimeIcon = () => {
    const iconProps = { size: 24, color: '#FFBD59' };

    switch (timeIcon) {
      case 'sunrise':
        return <Sunrise {...iconProps} />;
      case 'sunset':
        return <Sunset {...iconProps} />;
      case 'moon':
        return <Moon {...iconProps} />;
      default:
        return <Sun {...iconProps} />;
    }
  };

  const getDaysText = () => {
    const days = profile?.transformation_days || 0;
    if (days === 0) return null;
    if (days === 1) return 'Ngày 1';
    return `Ngày ${days}`;
  };

  const isMilestone = () => {
    const days = profile?.transformation_days || 0;
    return days === 7 || days === 14 || days === 21 || days === 30 ||
           days === 60 || days === 90 || days === 100 || days === 365;
  };

  const daysText = getDaysText();

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.iconContainer}>
        {renderTimeIcon()}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.greetingText}>{greeting}</Text>

        {daysText && (
          <View style={styles.daysContainer}>
            {isMilestone() && <Sparkles size={14} color="#FFD700" style={styles.sparkle} />}
            <Text style={[styles.daysText, isMilestone() && styles.milestoneText]}>
              {daysText}
            </Text>
            {isMilestone() && <Sparkles size={14} color="#FFD700" style={styles.sparkle} />}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFBD59',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  daysText: {
    color: '#FFBD59',
    fontSize: 13,
    fontWeight: '600',
  },
  milestoneText: {
    color: '#FFD700',
    fontWeight: '700',
  },
  sparkle: {
    marginHorizontal: 4,
  },
});

export default PersonalizedGreeting;
