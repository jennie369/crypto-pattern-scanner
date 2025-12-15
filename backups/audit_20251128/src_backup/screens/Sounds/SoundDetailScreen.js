/**
 * Gemral - Sound Detail Screen
 * Shows details of a sound/audio track
 * Dark glass theme
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Music, Play, Pause, Plus, User, Clock, TrendingUp } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

export default function SoundDetailScreen({ navigation, route }) {
  const { soundId } = route.params || {};
  const [sound, setSound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadSound();
  }, [soundId]);

  const loadSound = async () => {
    try {
      // TODO: Replace with actual API call
      // const result = await soundService.getSoundById(soundId);
      // setSound(result.data);

      // Mock data
      setSound({
        id: soundId,
        name: 'Epic Background Music',
        artist: 'Studio Audio',
        duration: '2:45',
        uses_count: 1234,
        cover_url: null,
        genre: 'Electronic',
        bpm: 120,
      });
    } catch (error) {
      console.error('[SoundDetail] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement audio playback
  };

  const handleUseSound = () => {
    navigation.navigate('Home', {
      screen: 'CreatePost',
      params: { selectedSound: sound },
    });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi Tiết Âm Thanh</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Cover Art */}
          <View style={styles.coverContainer}>
            {sound?.cover_url ? (
              <Image source={{ uri: sound.cover_url }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Music size={64} color={COLORS.gold} />
              </View>
            )}

            {/* Play Button Overlay */}
            <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
              {isPlaying ? (
                <Pause size={32} color="#112250" fill="#112250" />
              ) : (
                <Play size={32} color="#112250" fill="#112250" />
              )}
            </TouchableOpacity>
          </View>

          {/* Sound Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.soundName}>{sound?.name || 'Unknown Sound'}</Text>
            <View style={styles.artistRow}>
              <User size={16} color={COLORS.textMuted} />
              <Text style={styles.artistName}>{sound?.artist || 'Unknown Artist'}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Clock size={18} color={COLORS.gold} />
              <Text style={styles.statValue}>{sound?.duration || '0:00'}</Text>
              <Text style={styles.statLabel}>Thời lượng</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <TrendingUp size={18} color={COLORS.success} />
              <Text style={styles.statValue}>{sound?.uses_count?.toLocaleString() || 0}</Text>
              <Text style={styles.statLabel}>Lượt dùng</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Music size={18} color={COLORS.purple} />
              <Text style={styles.statValue}>{sound?.bpm || '-'}</Text>
              <Text style={styles.statLabel}>BPM</Text>
            </View>
          </View>

          {/* Genre Badge */}
          {sound?.genre && (
            <View style={styles.genreContainer}>
              <Text style={styles.genreLabel}>Thể loại</Text>
              <View style={styles.genreBadge}>
                <Text style={styles.genreText}>{sound.genre}</Text>
              </View>
            </View>
          )}

          {/* Use Sound Button */}
          <TouchableOpacity style={styles.useButton} onPress={handleUseSound}>
            <Plus size={20} color="#112250" />
            <Text style={styles.useButtonText}>Sử dụng âm thanh này</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  coverContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
    position: 'relative',
  },
  coverImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
  },
  coverPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  playButton: {
    position: 'absolute',
    bottom: SPACING.lg + 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  soundName: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  artistName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  genreContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  genreLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  genreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  genreText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.gold,
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: 16,
  },
  useButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },
});
