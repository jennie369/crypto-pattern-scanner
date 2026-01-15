/**
 * PROACTIVE MESSAGE CARD COMPONENT
 * Displays AI-generated proactive messages
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Sparkles,
  Bell,
  Flame,
  Trophy,
  MessageCircle,
  Clock,
  Eye,
  X,
  ChevronRight,
  Heart,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react-native';

// Message type icons and colors
const MESSAGE_TYPE_CONFIG = {
  daily_insight: {
    icon: Sparkles,
    color: '#FFBD59',
    label: 'Suy ngẫm',
  },
  ritual_reminder: {
    icon: Bell,
    color: '#87CEEB',
    label: 'Nhắc nhở',
  },
  streak_alert: {
    icon: AlertTriangle,
    color: '#FF9800',
    label: 'Cảnh báo',
  },
  streak_milestone: {
    icon: Trophy,
    color: '#FFD700',
    label: 'Cột mốc',
  },
  pattern_observation: {
    icon: Eye,
    color: '#9370DB',
    label: 'Quan sát',
  },
  celebration: {
    icon: Heart,
    color: '#FF69B4',
    label: 'Chúc mừng',
  },
  encouragement: {
    icon: Lightbulb,
    color: '#4CAF50',
    label: 'Động viên',
  },
  check_in: {
    icon: MessageCircle,
    color: '#2196F3',
    label: 'Hỏi thăm',
  },
  weekly_summary: {
    icon: Flame,
    color: '#FF6347',
    label: 'Tổng kết',
  },
  custom: {
    icon: Sparkles,
    color: '#FFBD59',
    label: 'Thông báo',
  },
};

const ProactiveMessageCard = ({
  message,
  onRead,
  onDismiss,
  onRespond,
  compact = false,
  style,
}) => {
  if (!message) return null;

  const config = MESSAGE_TYPE_CONFIG[message.message_type] || MESSAGE_TYPE_CONFIG.custom;
  const IconComponent = config.icon;

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Compact version for list
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={onRead}
        activeOpacity={0.7}
      >
        <View style={[styles.compactIcon, { backgroundColor: `${config.color}20` }]}>
          <IconComponent size={16} color={config.color} />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {message.title}
          </Text>
          <Text style={styles.compactText} numberOfLines={1}>
            {message.content}
          </Text>
        </View>
        <ChevronRight size={16} color="#808080" />
      </TouchableOpacity>
    );
  }

  // Full card version
  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
          <IconComponent size={20} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.typeLabel, { color: config.color }]}>
            {config.label}
          </Text>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#808080" />
            <Text style={styles.timeText}>
              {formatTime(message.scheduled_for || message.created_at)}
            </Text>
          </View>
        </View>
        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color="#808080" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{message.title}</Text>
        <Text style={styles.messageText}>{message.content}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onRespond && (
          <TouchableOpacity
            style={styles.respondButton}
            onPress={onRespond}
          >
            <MessageCircle size={14} color="#FFBD59" />
            <Text style={styles.respondText}>Trả lời</Text>
          </TouchableOpacity>
        )}
        {onRead && !message.was_read && (
          <TouchableOpacity
            style={styles.readButton}
            onPress={onRead}
          >
            <Eye size={14} color="#FFFFFF" />
            <Text style={styles.readText}>Đã xem</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Horizontal scrollable list of messages
export const ProactiveMessageList = ({ messages, onReadMessage, onDismissMessage, style }) => {
  if (!messages || messages.length === 0) return null;

  return (
    <View style={[styles.listContainer, style]}>
      <View style={styles.listHeader}>
        <Sparkles size={16} color="#FFBD59" />
        <Text style={styles.listTitle}>Tin nhắn từ GEM</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{messages.length}</Text>
        </View>
      </View>
      <View style={styles.listContent}>
        {messages.slice(0, 3).map((message) => (
          <ProactiveMessageCard
            key={message.id}
            message={message}
            compact
            onRead={() => onReadMessage?.(message)}
            onDismiss={() => onDismissMessage?.(message)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#FFBD59',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    color: '#808080',
    fontSize: 11,
    marginLeft: 4,
  },
  dismissButton: {
    padding: 4,
  },
  content: {
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  messageText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  respondButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  respondText: {
    color: '#FFBD59',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  readText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  compactTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  compactText: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 2,
  },

  // List styles
  listContainer: {
    marginBottom: 16,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  badge: {
    backgroundColor: '#FFBD59',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#1A1A2E',
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {},
});

export default ProactiveMessageCard;
