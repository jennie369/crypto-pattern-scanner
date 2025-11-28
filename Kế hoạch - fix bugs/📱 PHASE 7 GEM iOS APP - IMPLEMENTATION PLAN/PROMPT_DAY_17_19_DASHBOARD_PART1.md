# 📊 DAY 17-19: AI CHAT → DASHBOARD IN ACCOUNT TAB

**Timeline:** 10 giờ (3 ngày x 3-4 giờ/ngày)  
**Priority:** CRITICAL - Game-changing feature  
**Dependencies:** Phase 1 complete, Voice & Export done  
**Feature:** AI tự động detect response → Suggest widgets → Widgets xuất hiện trong Tab Tài Sản

---

## 🎯 OBJECTIVES

Implement AI Chat → Dashboard widgets trong AccountScreen.js:
- AI detect response type (manifestation, crystal, trading)
- Show "Add to Dashboard?" suggestion trong chat
- User click "Yes" → Widgets tạo tự động
- Widgets xuất hiện trong **AccountScreen.js** (Tab Tài Sản)
- Position #2 (sau Profile Header)
- 4 widget types: Goal, Affirmation, Checklist, Stats
- Collapsible section
- Real-time interactions

---

## 📦 DELIVERABLES

### **Services:**
1. `src/services/responseDetectionService.js` - AI response type detection
2. `src/services/widgetFactoryService.js` - Widget creation from AI data
3. `src/services/widgetManagementService.js` - CRUD operations
4. `src/services/widgetInteractionService.js` - Cross-widget actions

### **Components:**
1. `src/components/GemMaster/WidgetSuggestionCard.js` - "Add to Dashboard?" UI
2. `src/components/GemMaster/WidgetPreviewModal.js` - Preview before adding
3. `src/components/GemMaster/GoalTrackingCard.js` - Goal widget
4. `src/components/GemMaster/AffirmationCard.js` - Affirmation widget
5. `src/components/GemMaster/ActionChecklistCard.js` - Checklist widget
6. `src/components/GemMaster/StatsWidget.js` - Stats widget

### **Updates:**
1. `src/screens/tabs/AccountScreen.js` - **MAJOR UPDATE** - Add Dashboard section
2. `src/screens/GemMaster/GemMasterScreen.js` - Add widget suggestion flow

### **Database:**
1. `user_widgets` table
2. `widget_progress` table
3. `widget_interactions` table

---

## 🏗️ IMPLEMENTATION PLAN

### **STEP 1: Response Detection Service (2h)**

#### **File: `src/services/responseDetectionService.js`**

```javascript
// AI response type detection
class ResponseDetectionService {
  /**
   * Response types with detection rules
   */
  RESPONSE_TYPES = {
    MANIFESTATION_GOAL: {
      triggers: ['manifest', 'goal', 'achieve', 'target', 'thu nhập', 'giàu có', 'thành công'],
      hasFields: ['target_amount', 'timeline', 'affirmations', 'action_plan'],
      widgetTypes: ['GOAL_CARD', 'AFFIRMATION_CARD', 'ACTION_CHECKLIST'],
      confidence: 0.95,
      suggestDashboard: true,
    },
    
    CRYSTAL_HEALING: {
      triggers: ['crystal', 'stress', 'anxiety', 'chakra', 'năng lượng', 'thạch anh', 'healing'],
      hasFields: ['crystal_names', 'placement', 'usage_guide', 'chakra_alignment'],
      widgetTypes: ['CRYSTAL_GRID', 'USAGE_GUIDE'],
      confidence: 0.92,
      suggestDashboard: true,
    },
    
    TRADING_ANALYSIS: {
      triggers: ['btc', 'trade', 'loss', 'pattern', 'win rate', 'strategy', 'phân tích'],
      hasFields: ['mistakes', 'spiritual_insight', 'action_plan', 'patterns'],
      widgetTypes: ['CROSS_DOMAIN_CARD', 'TRADING_CHECKLIST'],
      confidence: 0.88,
      suggestDashboard: true,
    },
    
    GENERAL_ADVICE: {
      triggers: ['how', 'what', 'explain', 'why', 'tell me', 'tại sao', 'như thế nào'],
      hasFields: null,
      widgetTypes: null,
      confidence: 0.85,
      suggestDashboard: false, // No widget needed
    },
  };

  /**
   * Detect response type from AI response
   */
  detectResponseType(aiResponse, userQuery) {
    const text = (aiResponse + ' ' + userQuery).toLowerCase();
    const detections = [];
    
    // Check each response type
    Object.entries(this.RESPONSE_TYPES).forEach(([type, rules]) => {
      const triggerMatches = rules.triggers.filter(trigger => 
        text.includes(trigger.toLowerCase())
      ).length;
      
      if (triggerMatches > 0) {
        const confidence = (triggerMatches / rules.triggers.length) * rules.confidence;
        
        detections.push({
          type,
          confidence,
          triggerMatches,
          rules,
        });
      }
    });
    
    // Sort by confidence
    detections.sort((a, b) => b.confidence - a.confidence);
    
    // Return highest confidence
    return detections.length > 0 ? detections[0] : null;
  }

  /**
   * Extract structured data from AI response
   */
  extractStructuredData(aiResponse, responseType) {
    const data = {};
    
    switch (responseType) {
      case 'MANIFESTATION_GOAL':
        data.goalTitle = this.extractGoalTitle(aiResponse);
        data.targetAmount = this.extractTargetAmount(aiResponse);
        data.timeline = this.extractTimeline(aiResponse);
        data.affirmations = this.extractAffirmations(aiResponse);
        data.actionSteps = this.extractActionSteps(aiResponse);
        data.crystalRecommendations = this.extractCrystals(aiResponse);
        break;
        
      case 'CRYSTAL_HEALING':
        data.crystalNames = this.extractCrystals(aiResponse);
        data.usageGuide = this.extractUsageGuide(aiResponse);
        data.placement = this.extractPlacement(aiResponse);
        break;
        
      case 'TRADING_ANALYSIS':
        data.mistakes = this.extractMistakes(aiResponse);
        data.spiritualInsight = this.extractInsights(aiResponse);
        data.actionPlan = this.extractActionSteps(aiResponse);
        break;
    }
    
    return data;
  }

  /**
   * Helper: Extract goal title
   */
  extractGoalTitle(text) {
    // Look for patterns like "manifest X", "goal: X", "achieve X"
    const patterns = [
      /manifest\s+([^.!?\n]+)/i,
      /goal[:\s]+([^.!?\n]+)/i,
      /achieve\s+([^.!?\n]+)/i,
      /thu nhập[:\s]+([^.!?\n]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return 'Mục tiêu của bạn';
  }

  /**
   * Helper: Extract target amount
   */
  extractTargetAmount(text) {
    // Look for numbers with M, triệu, million
    const patterns = [
      /(\d+)\s*M(?!\w)/i,
      /(\d+)\s*triệu/i,
      /(\d+)\s*million/i,
      /(\d+[,\.]\d+)\s*(?:M|triệu|million)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const num = parseFloat(match[1].replace(',', '.'));
        return num * 1000000; // Convert to actual amount
      }
    }
    
    return 100000000; // Default 100M
  }

  /**
   * Helper: Extract timeline
   */
  extractTimeline(text) {
    // Look for patterns like "6 tháng", "3 months", "1 năm"
    const patterns = [
      /(\d+)\s*(?:tháng|months?)/i,
      /(\d+)\s*(?:năm|years?)/i,
      /(\d+)\s*(?:tuần|weeks?)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return '6 tháng'; // Default
  }

  /**
   * Helper: Extract affirmations
   */
  extractAffirmations(text) {
    const affirmations = [];
    
    // Look for quoted text or bullet points
    const quotedPattern = /"([^"]+)"/g;
    let match;
    
    while ((match = quotedPattern.exec(text)) !== null) {
      if (match[1].length > 10 && match[1].length < 200) {
        affirmations.push(match[1].trim());
      }
    }
    
    // Look for bullet points
    const bulletPattern = /[•✨-]\s*([^\n]+)/g;
    while ((match = bulletPattern.exec(text)) !== null) {
      const line = match[1].trim();
      if (line.length > 10 && line.length < 200 && !line.includes(':')) {
        affirmations.push(line);
      }
    }
    
    // Deduplicate
    return [...new Set(affirmations)].slice(0, 5);
  }

  /**
   * Helper: Extract action steps
   */
  extractActionSteps(text) {
    const steps = [];
    
    // Look for numbered lists or action items
    const patterns = [
      /\d+\.\s*([^\n]+)/g,
      /Week\s+\d+[:\s]+([^\n]+)/gi,
      /Step\s+\d+[:\s]+([^\n]+)/gi,
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const step = match[1].trim();
        if (step.length > 5 && step.length < 150) {
          steps.push(step);
        }
      }
    });
    
    // Deduplicate and limit
    return [...new Set(steps)].slice(0, 10);
  }

  /**
   * Helper: Extract crystal recommendations
   */
  extractCrystals(text) {
    const crystals = [];
    const knownCrystals = [
      'Citrine', 'Pyrite', 'Green Aventurine', 'Rose Quartz', 'Amethyst',
      'Clear Quartz', 'Black Tourmaline', 'Carnelian', 'Tiger Eye',
      'Thạch anh', 'Thạch anh hồng', 'Thạch anh tím',
    ];
    
    knownCrystals.forEach(crystal => {
      if (text.toLowerCase().includes(crystal.toLowerCase())) {
        crystals.push(crystal);
      }
    });
    
    return [...new Set(crystals)];
  }

  /**
   * Helper: Extract usage guide
   */
  extractUsageGuide(text) {
    // Extract paragraphs about usage
    const sections = text.split('\n\n');
    const usageSection = sections.find(section => 
      section.toLowerCase().includes('use') ||
      section.toLowerCase().includes('cách dùng') ||
      section.toLowerCase().includes('sử dụng')
    );
    
    return usageSection || text.slice(0, 300);
  }

  /**
   * Helper: Extract placement instructions
   */
  extractPlacement(text) {
    const patterns = [
      /place[d]?\s+(?:on|at|in)\s+([^.!?\n]+)/i,
      /đặt\s+(?:ở|tại)\s+([^.!?\n]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return 'Mang theo người hoặc đặt trong phòng';
  }

  /**
   * Helper: Extract trading mistakes
   */
  extractMistakes(text) {
    const mistakes = [];
    const sections = text.split('\n');
    
    sections.forEach(line => {
      if (line.toLowerCase().includes('mistake') || 
          line.toLowerCase().includes('sai lầm') ||
          line.includes('❌')) {
        mistakes.push(line.replace(/[❌-]/g, '').trim());
      }
    });
    
    return mistakes.slice(0, 5);
  }

  /**
   * Helper: Extract insights
   */
  extractInsights(text) {
    const insights = [];
    const sections = text.split('\n');
    
    sections.forEach(line => {
      if (line.toLowerCase().includes('insight') || 
          line.toLowerCase().includes('nhận xét') ||
          line.includes('💡')) {
        insights.push(line.replace(/[💡-]/g, '').trim());
      }
    });
    
    return insights.slice(0, 3);
  }

  /**
   * Should suggest dashboard for this response?
   */
  shouldSuggestDashboard(detection) {
    if (!detection) return false;
    
    return detection.rules.suggestDashboard && 
           detection.confidence >= 0.70;
  }
}

export default new ResponseDetectionService();
```

---

### **STEP 2: Widget Factory Service (2h)**

#### **File: `src/services/widgetFactoryService.js`**

```javascript
import { generateId } from '../utils/helpers';
import responseDetectionService from './responseDetectionService';

class WidgetFactoryService {
  /**
   * Create widgets from AI response
   */
  async createWidgetsFromResponse(aiResponse, userQuery, userId) {
    // Detect response type
    const detection = responseDetectionService.detectResponseType(aiResponse, userQuery);
    
    if (!detection || !detection.rules.suggestDashboard) {
      return null;
    }
    
    // Extract structured data
    const data = responseDetectionService.extractStructuredData(
      aiResponse,
      detection.type
    );
    
    // Create widgets based on type
    const widgets = [];
    
    switch (detection.type) {
      case 'MANIFESTATION_GOAL':
        widgets.push(
          this.createGoalWidget(data, userId),
          this.createAffirmationWidget(data, userId),
          this.createActionChecklistWidget(data, userId)
        );
        break;
        
      case 'CRYSTAL_HEALING':
        widgets.push(
          this.createCrystalWidget(data, userId)
        );
        break;
        
      case 'TRADING_ANALYSIS':
        widgets.push(
          this.createTradingWidget(data, userId)
        );
        break;
    }
    
    return {
      widgets: widgets.filter(w => w !== null),
      detection,
      data,
    };
  }

  /**
   * Create Goal Tracking widget
   */
  createGoalWidget(data, userId) {
    return {
      id: generateId(),
      user_id: userId,
      type: 'GOAL_CARD',
      title: data.goalTitle || 'Mục tiêu của bạn',
      data: {
        targetAmount: data.targetAmount || 100000000,
        currentAmount: 0,
        timeline: data.timeline || '6 tháng',
        targetDate: this.calculateTargetDate(data.timeline),
        affirmations: data.affirmations || [],
        crystals: data.crystalRecommendations || [],
      },
      position: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Create Affirmation widget
   */
  createAffirmationWidget(data, userId) {
    if (!data.affirmations || data.affirmations.length === 0) {
      return null;
    }
    
    return {
      id: generateId(),
      user_id: userId,
      type: 'AFFIRMATION_CARD',
      title: 'Daily Affirmations',
      data: {
        affirmations: data.affirmations,
        currentIndex: 0,
        completedToday: 0,
        streak: 0,
      },
      position: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Create Action Checklist widget
   */
  createActionChecklistWidget(data, userId) {
    if (!data.actionSteps || data.actionSteps.length === 0) {
      return null;
    }
    
    return {
      id: generateId(),
      user_id: userId,
      type: 'ACTION_CHECKLIST',
      title: 'Action Plan',
      data: {
        tasks: data.actionSteps.map((step, index) => ({
          id: generateId(),
          title: step,
          completed: false,
          order: index,
        })),
      },
      position: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Create Crystal widget
   */
  createCrystalWidget(data, userId) {
    return {
      id: generateId(),
      user_id: userId,
      type: 'CRYSTAL_GRID',
      title: 'Crystal Recommendations',
      data: {
        crystals: data.crystalNames || [],
        usageGuide: data.usageGuide || '',
        placement: data.placement || '',
      },
      position: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Create Trading widget
   */
  createTradingWidget(data, userId) {
    return {
      id: generateId(),
      user_id: userId,
      type: 'CROSS_DOMAIN_CARD',
      title: 'Trading Analysis',
      data: {
        mistakes: data.mistakes || [],
        insights: data.spiritualInsight || [],
        actionPlan: data.actionPlan || [],
      },
      position: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Helper: Calculate target date from timeline
   */
  calculateTargetDate(timeline) {
    const now = new Date();
    const match = timeline.match(/(\d+)\s*(tháng|months?|năm|years?)/i);
    
    if (!match) {
      // Default 6 months
      now.setMonth(now.getMonth() + 6);
      return now.toISOString();
    }
    
    const num = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit.includes('tháng') || unit.includes('month')) {
      now.setMonth(now.getMonth() + num);
    } else if (unit.includes('năm') || unit.includes('year')) {
      now.setFullYear(now.getFullYear() + num);
    }
    
    return now.toISOString();
  }
}

export default new WidgetFactoryService();
```

---

### **STEP 3: Widget Management Service (1h)**

#### **File: `src/services/widgetManagementService.js`**

```javascript
import { supabase } from '../config/supabase';

class WidgetManagementService {
  /**
   * Get user's widgets
   */
  async getUserWidgets(userId) {
    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching widgets:', error);
      return [];
    }
  }

  /**
   * Create widget
   */
  async createWidget(widget) {
    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .insert(widget)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating widget:', error);
      throw error;
    }
  }

  /**
   * Create multiple widgets
   */
  async createWidgets(widgets) {
    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .insert(widgets)
        .select();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating widgets:', error);
      throw error;
    }
  }

  /**
   * Update widget
   */
  async updateWidget(widgetId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widgetId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating widget:', error);
      throw error;
    }
  }

  /**
   * Delete widget (soft delete)
   */
  async deleteWidget(widgetId) {
    try {
      const { error } = await supabase
        .from('user_widgets')
        .update({ is_active: false })
        .eq('id', widgetId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting widget:', error);
      throw error;
    }
  }

  /**
   * Update widget position
   */
  async updateWidgetPosition(widgetId, newPosition) {
    return this.updateWidget(widgetId, { position: newPosition });
  }

  /**
   * Track widget interaction
   */
  async trackInteraction(widgetId, userId, interactionType, interactionData = {}) {
    try {
      const { error } = await supabase
        .from('widget_interactions')
        .insert({
          widget_id: widgetId,
          user_id: userId,
          interaction_type: interactionType,
          interaction_data: interactionData,
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(widgetId, currentAmount) {
    const widget = await this.getWidget(widgetId);
    
    if (!widget || widget.type !== 'GOAL_CARD') {
      throw new Error('Invalid widget for progress update');
    }
    
    const targetAmount = widget.data.targetAmount;
    const percentage = (currentAmount / targetAmount) * 100;
    
    // Check for milestones
    const milestones = [10, 25, 50, 75, 90, 100];
    const previousPercentage = (widget.data.currentAmount / targetAmount) * 100;
    
    const newMilestone = milestones.find(m => 
      percentage >= m && previousPercentage < m
    );
    
    // Update widget
    await this.updateWidget(widgetId, {
      data: {
        ...widget.data,
        currentAmount,
      },
    });
    
    // Track progress
    await supabase.from('widget_progress').insert({
      widget_id: widgetId,
      progress_date: new Date().toISOString().split('T')[0],
      current_value: currentAmount,
      target_value: targetAmount,
      percentage: percentage,
      milestones_hit: newMilestone ? [newMilestone] : [],
    });
    
    return {
      newMilestone,
      percentage,
    };
  }

  /**
   * Get widget
   */
  async getWidget(widgetId) {
    try {
      const { data, error } = await supabase
        .from('user_widgets')
        .select('*')
        .eq('id', widgetId)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching widget:', error);
      return null;
    }
  }
}

export default new WidgetManagementService();
```

---

### **STEP 4: Widget Components (3h)**

#### **File: `src/components/GemMaster/GoalTrackingCard.js`**

```javascript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { TrendingUp, Edit3, MoreVertical } from 'lucide-react-native';
import widgetManagementService from '../../services/widgetManagementService';

const GoalTrackingCard = ({ widget, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState('');

  const { targetAmount, currentAmount, timeline, targetDate } = widget.data;
  const percentage = (currentAmount / targetAmount) * 100;
  
  // Calculate days left
  const daysLeft = Math.ceil(
    (new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const handleUpdateProgress = async () => {
    if (!editAmount || isNaN(editAmount)) {
      Alert.alert('Lỗi', 'Vui lòng nhập số hợp lệ');
      return;
    }

    try {
      const newAmount = parseFloat(editAmount);
      const result = await widgetManagementService.updateGoalProgress(
        widget.id,
        newAmount
      );

      if (result.newMilestone) {
        Alert.alert(
          '🎉 Milestone!',
          `Chúc mừng! Bạn đã đạt ${result.newMilestone}% mục tiêu!`
        );
      }

      setIsEditing(false);
      setEditAmount('');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật progress');
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    return amount.toLocaleString('vi-VN');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <TrendingUp size={20} color="#FFBD59" />
          <Text style={styles.title} numberOfLines={1}>
            {widget.title}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <MoreVertical size={18} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <Text style={styles.timeline}>
        📅 Target: {new Date(targetDate).toLocaleDateString('vi-VN')} ({daysLeft} days left)
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]}>
            <Text style={styles.progressText}>{percentage.toFixed(0)}%</Text>
          </View>
        </View>
        <Text style={styles.progressAmount}>
          {formatCurrency(currentAmount)} / {formatCurrency(targetAmount)} VND
        </Text>
      </View>

      {/* Update Progress */}
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={editAmount}
            onChangeText={setEditAmount}
            placeholder="Nhập số tiền hiện tại..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleUpdateProgress}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setIsEditing(false);
              setEditAmount('');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => setIsEditing(true)}
          >
            <Edit3 size={16} color="#0F1030" />
            <Text style={styles.updateButtonText}>Update Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reminders */}
      <View style={styles.reminderInfo}>
        <Text style={styles.reminderText}>
          🔔 Daily reminders: <Text style={styles.reminderStatus}>ON</Text>
        </Text>
        <Text style={styles.reminderNext}>⏰ Next: 8:00 AM</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  menuButton: {
    padding: 4,
  },
  timeline: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFBD59',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F1030',
  },
  progressAmount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  editContainer: {
    gap: 8,
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  saveButton: {
    backgroundColor: '#FFBD59',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F1030',
  },
  cancelButton: {
    padding: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  updateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFBD59',
    borderRadius: 12,
    padding: 10,
  },
  updateButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F1030',
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFBD59',
  },
  reminderInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
  },
  reminderText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  reminderStatus: {
    color: '#27ae60',
    fontWeight: '700',
  },
  reminderNext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
});

export default GoalTrackingCard;
```

**DUE TO LENGTH LIMIT, I'll continue in the next file...**

---

## ✅ PARTIAL DELIVERABLE

This is **Part 1 of Day 17-19 prompt**. 

**Completed so far:**
- Response Detection Service ✅
- Widget Factory Service ✅
- Widget Management Service ✅
- GoalTrackingCard Component ✅

**Still needed (will continue):**
- AffirmationCard Component
- ActionChecklistCard Component
- StatsWidget Component
- WidgetSuggestionCard Component
- AccountScreen.js integration
- Database schema
- Testing checklist

Would you like me to create **Part 2** with the remaining components and integration?
