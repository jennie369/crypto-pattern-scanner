/**
 * Gemral - Poll Display Component
 * Shows poll with voting functionality
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { BarChart3, Check, Clock, Users } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';
import { useAuth } from '../contexts/AuthContext';

const PollDisplay = ({
  poll, // { id, question, options: [{text, votes}], allowMultiple, endsAt, totalVotes, userVotes }
  onVote,
  loading = false,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Animation for vote bars
  const barAnimations = poll?.options?.map(() => new Animated.Value(0)) || [];

  useEffect(() => {
    if (poll?.userVotes?.length > 0) {
      setHasVoted(true);
      setSelectedOptions(poll.userVotes);
    }

    // Check if poll has expired
    if (poll?.endsAt) {
      const endDate = new Date(poll.endsAt);
      setIsExpired(endDate < new Date());
    }
  }, [poll]);

  // Animate bars when showing results
  useEffect(() => {
    if (hasVoted || isExpired) {
      barAnimations.forEach((anim, index) => {
        const percentage = getVotePercentage(index);
        Animated.timing(anim, {
          toValue: percentage,
          duration: 500,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [hasVoted, isExpired, poll?.options]);

  const getVotePercentage = (optionIndex) => {
    const totalVotes = poll?.totalVotes || 0;
    const optionVotes = poll?.options?.[optionIndex]?.votes || 0;
    return totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
  };

  const handleOptionPress = (index) => {
    if (!isAuthenticated || hasVoted || isExpired || loading) return;

    if (poll?.allowMultiple) {
      // Toggle selection for multiple choice
      if (selectedOptions.includes(index)) {
        setSelectedOptions(selectedOptions.filter(i => i !== index));
      } else {
        setSelectedOptions([...selectedOptions, index]);
      }
    } else {
      // Single choice - select and vote immediately
      setSelectedOptions([index]);
      handleVote([index]);
    }
  };

  const handleVote = async (votes = selectedOptions) => {
    if (votes.length === 0 || loading) return;

    const success = await onVote?.(votes);
    if (success !== false) {
      setHasVoted(true);
    }
  };

  const formatTimeRemaining = () => {
    if (!poll?.endsAt) return null;

    const endDate = new Date(poll.endsAt);
    const now = new Date();
    const diff = endDate - now;

    if (diff <= 0) return 'Da ket thuc';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Con ${days} ngay`;
    }
    if (hours > 0) {
      return `Con ${hours} gio ${minutes} phut`;
    }
    return `Con ${minutes} phut`;
  };

  if (!poll) return null;

  const showResults = hasVoted || isExpired;

  return (
    <View style={styles.container}>
      {/* Question */}
      <View style={styles.questionContainer}>
        <BarChart3 size={18} color={COLORS.purple} />
        <Text style={styles.question}>{poll.question}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {poll.options?.map((option, index) => {
          const isSelected = selectedOptions.includes(index);
          const percentage = getVotePercentage(index);
          const barWidth = barAnimations[index] || new Animated.Value(0);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionItem,
                isSelected && styles.optionItemSelected,
                (hasVoted || isExpired) && styles.optionItemVoted,
              ]}
              onPress={() => handleOptionPress(index)}
              disabled={hasVoted || isExpired || loading}
              activeOpacity={0.7}
            >
              {/* Background bar for results */}
              {showResults && (
                <Animated.View
                  style={[
                    styles.optionBar,
                    {
                      width: barWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                    isSelected && styles.optionBarSelected,
                  ]}
                />
              )}

              {/* Option content */}
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  {/* Checkbox/Radio indicator */}
                  {!showResults && (
                    <View style={[
                      styles.optionIndicator,
                      poll.allowMultiple ? styles.optionCheckbox : styles.optionRadio,
                      isSelected && styles.optionIndicatorSelected,
                    ]}>
                      {isSelected && <Check size={12} color={COLORS.textPrimary} />}
                    </View>
                  )}
                  {showResults && isSelected && (
                    <Check size={16} color={COLORS.success} style={styles.votedCheck} />
                  )}
                  <Text style={styles.optionText}>{option.text}</Text>
                </View>

                {/* Percentage and votes */}
                {showResults && (
                  <View style={styles.optionRight}>
                    <Text style={styles.optionPercentage}>
                      {percentage.toFixed(0)}%
                    </Text>
                    <Text style={styles.optionVotes}>
                      ({option.votes || 0})
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Submit button for multiple choice */}
      {poll.allowMultiple && !hasVoted && !isExpired && selectedOptions.length > 0 && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => handleVote()}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Dang gui...' : 'Gui phieu bau'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Footer info */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Users size={14} color={COLORS.textMuted} />
          <Text style={styles.footerText}>{poll.totalVotes || 0} phieu</Text>
        </View>

        {poll.endsAt && (
          <View style={styles.footerItem}>
            <Clock size={14} color={isExpired ? COLORS.error : COLORS.textMuted} />
            <Text style={[styles.footerText, isExpired && styles.footerTextExpired]}>
              {formatTimeRemaining()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * Poll Creator Component - for CreatePostScreen
 */
export const PollCreator = ({
  onPollChange,
  initialPoll = null,
}) => {
  const [question, setQuestion] = useState(initialPoll?.question || '');
  const [options, setOptions] = useState(initialPoll?.options || ['', '']);
  const [allowMultiple, setAllowMultiple] = useState(initialPoll?.allowMultiple || false);
  const [hasEndTime, setHasEndTime] = useState(false);
  const [endDays, setEndDays] = useState(1);

  useEffect(() => {
    if (question && options.filter(o => o.trim()).length >= 2) {
      onPollChange?.({
        question,
        options: options.filter(o => o.trim()).map(text => ({ text, votes: 0 })),
        allowMultiple,
        endsAt: hasEndTime ? new Date(Date.now() + endDays * 24 * 60 * 60 * 1000).toISOString() : null,
      });
    } else {
      onPollChange?.(null);
    }
  }, [question, options, allowMultiple, hasEndTime, endDays]);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const updateOption = (index, text) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };

  return (
    <View style={styles.creatorContainer}>
      {/* This is a placeholder - full implementation would include:
          - Question input
          - Option inputs with add/remove
          - Allow multiple toggle
          - End time picker
      */}
      <Text style={styles.creatorPlaceholder}>
        Poll Creator - Coming Soon
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  // Question
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  question: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  // Options
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
  },
  optionItemVoted: {
    backgroundColor: 'transparent',
  },
  optionBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 10,
  },
  optionBarSelected: {
    backgroundColor: 'rgba(106, 91, 255, 0.3)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCheckbox: {
    borderRadius: 4,
  },
  optionRadio: {
    borderRadius: 10,
  },
  optionIndicatorSelected: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.purple,
  },
  votedCheck: {
    marginRight: SPACING.xs,
  },
  optionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  optionPercentage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  optionVotes: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  // Submit button
  submitButton: {
    backgroundColor: COLORS.purple,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  footerTextExpired: {
    color: COLORS.error,
  },
  // Creator placeholder
  creatorContainer: {
    padding: SPACING.lg,
  },
  creatorPlaceholder: {
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default PollDisplay;
