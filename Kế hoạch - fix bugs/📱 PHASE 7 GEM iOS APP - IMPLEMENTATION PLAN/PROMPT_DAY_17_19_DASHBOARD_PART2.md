# 📊 DAY 17-19: DASHBOARD IN ACCOUNT TAB - PART 2

**This is Part 2 of the implementation prompt**  
**See Part 1 for:** Response Detection, Widget Factory, Widget Management, GoalTrackingCard

---

## 📦 CONTINUING FROM PART 1

### **STEP 4 (Continued): Widget Components**

#### **File: `src/components/GemMaster/AffirmationCard.js`**

```javascript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Volume2, Check, ChevronLeft, ChevronRight, Flame } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import widgetManagementService from '../../services/widgetManagementService';

const AffirmationCard = ({ widget, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(widget.data.currentIndex || 0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { affirmations, completedToday, streak } = widget.data;
  const currentAffirmation = affirmations[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < affirmations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReadAloud = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      
      await Speech.speak(currentAffirmation, {
        language: 'vi-VN',
        pitch: 1.0,
        rate: 0.8,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Error reading aloud:', error);
      setIsSpeaking(false);
    }
  };

  const handleMarkDone = async () => {
    try {
      const newCompletedToday = (completedToday || 0) + 1;
      
      await widgetManagementService.updateWidget(widget.id, {
        data: {
          ...widget.data,
          completedToday: newCompletedToday,
          currentIndex: (currentIndex + 1) % affirmations.length, // Move to next
        },
      });

      await widgetManagementService.trackInteraction(
        widget.id,
        widget.user_id,
        'AFFIRMATION_COMPLETED',
        { affirmation: currentAffirmation }
      );

      if (onComplete) {
        onComplete();
      }

      // Show encouragement
      if (newCompletedToday === 3) {
        Alert.alert('🎉 Amazing!', 'Bạn đã hoàn thành 3 affirmations hôm nay!');
      }
    } catch (error) {
      console.error('Error marking done:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>✨ Today's Affirmation</Text>

      {/* Affirmation Text */}
      <View style={styles.affirmationContainer}>
        <Text style={styles.affirmationText}>{currentAffirmation}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleReadAloud}
        >
          <Volume2 size={18} color={isSpeaking ? '#e74c3c' : '#FFBD59'} />
          <Text style={styles.actionText}>
            {isSpeaking ? 'Stop' : 'Read Aloud'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.doneButton]}
          onPress={handleMarkDone}
        >
          <Check size={18} color="#0F1030" />
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={20} color={currentIndex === 0 ? '#666' : '#FFBD59'} />
        </TouchableOpacity>

        <Text style={styles.navText}>
          {currentIndex + 1} / {affirmations.length}
        </Text>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === affirmations.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={currentIndex === affirmations.length - 1}
        >
          <ChevronRight
            size={20}
            color={currentIndex === affirmations.length - 1 ? '#666' : '#FFBD59'}
          />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          ✅ Completed {completedToday || 0}x today
        </Text>
        <View style={styles.streakContainer}>
          <Flame size={14} color="#e74c3c" />
          <Text style={styles.streakText}>{streak || 0}-day streak</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'linear-gradient(135deg, #9C0612 0%, #112250 100%)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  header: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFBD59',
    textAlign: 'center',
    marginBottom: 16,
  },
  affirmationContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
  },
  affirmationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFBD59',
  },
  doneButton: {
    backgroundColor: '#FFBD59',
  },
  doneText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F1030',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e74c3c',
  },
});

export default AffirmationCard;
```

#### **File: `src/components/GemMaster/ActionChecklistCard.js`**

```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Square, CheckSquare, Plus, MoreVertical } from 'lucide-react-native';
import widgetManagementService from '../../services/widgetManagementService';

const ActionChecklistCard = ({ widget, onTaskToggle }) => {
  const { tasks } = widget.data;
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const percentage = (completedCount / totalCount) * 100;

  const handleToggleTask = async (taskId) => {
    try {
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );

      await widgetManagementService.updateWidget(widget.id, {
        data: {
          ...widget.data,
          tasks: updatedTasks,
        },
      });

      await widgetManagementService.trackInteraction(
        widget.id,
        widget.user_id,
        'TASK_TOGGLED',
        { taskId, completed: !tasks.find(t => t.id === taskId).completed }
      );

      if (onTaskToggle) {
        onTaskToggle();
      }

      // Check if all completed
      const newCompletedCount = updatedTasks.filter(t => t.completed).length;
      if (newCompletedCount === totalCount) {
        Alert.alert(
          '🎉 All Done!',
          'Bạn đã hoàn thành tất cả tasks! Amazing work!'
        );
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật task');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{widget.title}</Text>
        <TouchableOpacity style={styles.menuButton}>
          <MoreVertical size={18} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      </View>

      {/* Tasks */}
      <View style={styles.tasksContainer}>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskItem}
            onPress={() => handleToggleTask(task.id)}
            activeOpacity={0.7}
          >
            {task.completed ? (
              <CheckSquare size={20} color="#27ae60" />
            ) : (
              <Square size={20} color="rgba(255, 255, 255, 0.5)" />
            )}
            <Text
              style={[
                styles.taskText,
                task.completed && styles.taskTextCompleted,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Progress: <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text> completed
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.addButton}>
        <Plus size={16} color="#FFBD59" />
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuButton: {
    padding: 4,
  },
  tasksContainer: {
    gap: 10,
    marginBottom: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  taskTextCompleted: {
    color: 'rgba(255, 255, 255, 0.5)',
    textDecorationLine: 'line-through',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  progressCount: {
    fontWeight: '700',
    color: '#FFBD59',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFBD59',
  },
});

export default ActionChecklistCard;
```

#### **File: `src/components/GemMaster/StatsWidget.js`**

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TrendingUp, Flame, Sparkles, Heart } from 'lucide-react-native';

const StatsWidget = ({ widget }) => {
  const [stats, setStats] = useState({
    activeGoals: 3,
    streak: 7,
    affirmations: 156,
    meditations: 8,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Your Stats</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <TrendingUp size={24} color="#FFBD59" />
          <Text style={styles.statNumber}>{stats.activeGoals}</Text>
          <Text style={styles.statLabel}>Active Goals</Text>
        </View>

        <View style={styles.statCard}>
          <Flame size={24} color="#e74c3c" />
          <Text style={styles.statNumber}>{stats.streak}</Text>
          <Text style={styles.statLabel}>🔥 Day Streak</Text>
        </View>

        <View style={styles.statCard}>
          <Sparkles size={24} color="#9b59b6" />
          <Text style={styles.statNumber}>{stats.affirmations}</Text>
          <Text style={styles.statLabel}>Affirmations</Text>
        </View>

        <View style={styles.statCard}>
          <Heart size={24} color="#e91e63" />
          <Text style={styles.statNumber}>{stats.meditations}</Text>
          <Text style={styles.statLabel}>Meditations</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>View Details →</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
  detailsButton: {
    padding: 12,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFBD59',
  },
});

export default StatsWidget;
```

---

### **STEP 5: AccountScreen Integration (2h)**

#### **Update: `src/screens/tabs/AccountScreen.js`**

This is the MOST IMPORTANT UPDATE - adding Dashboard section to existing Account screen.

```javascript
// Add imports at top
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Widget Components
import GoalTrackingCard from '../../components/GemMaster/GoalTrackingCard';
import AffirmationCard from '../../components/GemMaster/AffirmationCard';
import ActionChecklistCard from '../../components/GemMaster/ActionChecklistCard';
import StatsWidget from '../../components/GemMaster/StatsWidget';

// Services
import WidgetManagementService from '../../services/widgetManagementService';

// Existing components
import ProfileHeader from '../../components/Account/ProfileHeader';
import StatsRow from '../../components/Account/StatsRow';
// ... other existing components

const MOCK_USER_ID = 'user-123'; // Replace with real auth

const AccountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const scrollViewRef = useRef(null);
  const dashboardSectionRef = useRef(null);
  
  // Widgets state
  const [widgets, setWidgets] = useState([]);
  const [isWidgetSectionCollapsed, setIsWidgetSectionCollapsed] = useState(false);
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Load widgets on mount
  useEffect(() => {
    loadUserWidgets();
  }, []);
  
  // Handle deep link from notification
  useEffect(() => {
    if (route.params?.scrollToWidget) {
      handleDeepLinkToWidget(route.params.scrollToWidget);
    }
  }, [route.params]);
  
  const loadUserWidgets = async () => {
    try {
      setIsLoadingWidgets(true);
      const userWidgets = await WidgetManagementService.getUserWidgets(MOCK_USER_ID);
      setWidgets(userWidgets);
      
      // Auto-collapse if >3 widgets
      const savedPreference = await AsyncStorage.getItem('dashboard_collapsed');
      if (savedPreference !== null) {
        setIsWidgetSectionCollapsed(savedPreference === 'true');
      } else {
        setIsWidgetSectionCollapsed(userWidgets.length > 3);
      }
    } catch (error) {
      console.error('Error loading widgets:', error);
    } finally {
      setIsLoadingWidgets(false);
    }
  };
  
  const handleDeepLinkToWidget = async (widgetId) => {
    // Expand dashboard section
    setIsWidgetSectionCollapsed(false);
    
    // Wait for render
    setTimeout(() => {
      // Scroll to dashboard section
      if (dashboardSectionRef.current && scrollViewRef.current) {
        dashboardSectionRef.current.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current.scrollTo({ 
              y: y - 20, 
              animated: true 
            });
            
            // TODO: Highlight specific widget
            // highlightWidget(widgetId);
          }
        );
      }
    }, 300);
  };
  
  const toggleDashboardSection = async () => {
    const newState = !isWidgetSectionCollapsed;
    setIsWidgetSectionCollapsed(newState);
    await AsyncStorage.setItem('dashboard_collapsed', newState.toString());
  };
  
  const navigateToGemMaster = () => {
    navigation.navigate('GemMaster');
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserWidgets();
    setRefreshing(false);
  };
  
  const renderWidget = (widget) => {
    switch(widget.type) {
      case 'GOAL_CARD':
        return (
          <GoalTrackingCard 
            key={widget.id} 
            widget={widget}
            onUpdate={loadUserWidgets}
          />
        );
      case 'AFFIRMATION_CARD':
        return (
          <AffirmationCard 
            key={widget.id} 
            widget={widget}
            onComplete={loadUserWidgets}
          />
        );
      case 'ACTION_CHECKLIST':
        return (
          <ActionChecklistCard 
            key={widget.id} 
            widget={widget}
            onTaskToggle={loadUserWidgets}
          />
        );
      case 'STATS_WIDGET':
        return (
          <StatsWidget 
            key={widget.id} 
            widget={widget}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#FFBD59"
        />
      }
    >
      {/* 1. Profile Header */}
      <ProfileHeader />
      
      {/* 2. Dashboard Widgets Section - NEW! */}
      {widgets.length > 0 ? (
        <View 
          ref={dashboardSectionRef}
          style={styles.dashboardSection}
        >
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={toggleDashboardSection}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>
              📊 Dashboard - Goals & Actions
            </Text>
            {isWidgetSectionCollapsed ? (
              <ChevronDown size={20} color="#FFBD59" />
            ) : (
              <ChevronUp size={20} color="#FFBD59" />
            )}
          </TouchableOpacity>
          
          {!isWidgetSectionCollapsed && (
            <View style={styles.widgetsContainer}>
              {widgets.map(renderWidget)}
              
              {/* Add New Goal Button */}
              <TouchableOpacity 
                style={styles.addWidgetButton}
                onPress={navigateToGemMaster}
                activeOpacity={0.8}
              >
                <Plus size={20} color="#FFBD59" />
                <Text style={styles.addWidgetText}>
                  Thêm Mục Tiêu Mới
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        /* Empty State - No widgets yet */
        !isLoadingWidgets && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💎</Text>
            <Text style={styles.emptyTitle}>
              Chưa có mục tiêu nào
            </Text>
            <Text style={styles.emptyText}>
              Chat với GEM AI để tạo goals & affirmations!
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={navigateToGemMaster}
              activeOpacity={0.8}
            >
              <Text style={styles.createButtonText}>
                Bắt Đầu Ngay
              </Text>
            </TouchableOpacity>
          </View>
        )
      )}
      
      {/* 3. Stats Row */}
      <StatsRow />
      
      {/* 4. Đơn Hàng Của Tôi */}
      {/* ... existing sections ... */}
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1030',
  },
  
  // Dashboard Section
  dashboardSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  widgetsContainer: {
    padding: 12,
  },
  addWidgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addWidgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFBD59',
  },
  
  // Empty State
  emptyState: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 32,
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FFBD59',
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F1030',
  },
});

export default AccountScreen;
```

---

### **STEP 6: Database Schema**

```sql
-- Create user_widgets table
CREATE TABLE IF NOT EXISTS user_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  widget_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  data JSONB NOT NULL,
  position INTEGER DEFAULT 0,
  created_from_conversation_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create widget_progress table
CREATE TABLE IF NOT EXISTS widget_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id UUID REFERENCES user_widgets(id) ON DELETE CASCADE,
  progress_date DATE NOT NULL,
  current_value DECIMAL,
  target_value DECIMAL,
  percentage DECIMAL,
  milestones_hit JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create widget_interactions table
CREATE TABLE IF NOT EXISTS widget_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id UUID REFERENCES user_widgets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL,
  interaction_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_widgets_user ON user_widgets(user_id);
CREATE INDEX idx_user_widgets_active ON user_widgets(user_id, is_active);
CREATE INDEX idx_widget_progress_widget ON widget_progress(widget_id);
CREATE INDEX idx_widget_interactions_widget ON widget_interactions(widget_id);

-- RLS Policies
ALTER TABLE user_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_interactions ENABLE ROW LEVEL SECURITY;

-- user_widgets policies
CREATE POLICY "Users can view own widgets"
  ON user_widgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own widgets"
  ON user_widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widgets"
  ON user_widgets FOR UPDATE
  USING (auth.uid() = user_id);

-- widget_progress policies
CREATE POLICY "Users can view own progress"
  ON widget_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_widgets 
    WHERE user_widgets.id = widget_progress.widget_id 
    AND user_widgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own progress"
  ON widget_progress FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_widgets 
    WHERE user_widgets.id = widget_progress.widget_id 
    AND user_widgets.user_id = auth.uid()
  ));

-- widget_interactions policies
CREATE POLICY "Users can view own interactions"
  ON widget_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON widget_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## ✅ TESTING CHECKLIST

### **Service Tests:**
- [ ] Response detection accurate (>90%)
- [ ] Widget factory creates correct widgets
- [ ] Widget management CRUD works
- [ ] Extracted data accurate

### **Component Tests:**
- [ ] GoalTrackingCard renders & updates progress
- [ ] AffirmationCard reads aloud & marks done
- [ ] ActionChecklistCard toggles tasks
- [ ] StatsWidget displays accurate data

### **AccountScreen Tests:**
- [ ] Dashboard section renders at position #2
- [ ] Widgets load correctly
- [ ] Collapsible section works
- [ ] Empty state shows when no widgets
- [ ] "Thêm Mục Tiêu" navigates to GemMaster
- [ ] Pull-to-refresh works
- [ ] Deep link from notification works

### **Integration Tests:**
- [ ] Create widget from chat → Shows in Account
- [ ] Update widget → Reflects in Account
- [ ] Delete widget → Removes from Account
- [ ] Cross-widget actions work
- [ ] Stats update in real-time

### **Database Tests:**
- [ ] Tables created successfully
- [ ] RLS policies working
- [ ] Indexes improve performance
- [ ] Data persists correctly

---

## 🎯 SUCCESS CRITERIA

- ✅ Dashboard section in AccountScreen position #2
- ✅ 4 widget types working
- ✅ Collapsible section functional
- ✅ Empty state attractive
- ✅ Widget creation from chat works
- ✅ Real-time updates working
- ✅ Deep linking from notifications works
- ✅ No breaking changes to existing Account features

---

**FILES TO COMBINE:**
- Part 1: Services & GoalTrackingCard
- Part 2: Remaining components & integration

**NEXT:** Day 20-22 - Smart Notifications 🔔

🚀 **READY FOR DASHBOARD IMPLEMENTATION!**
