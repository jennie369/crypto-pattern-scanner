# Phase 12: Widget Interactions & Notifications

## Thông Tin Phase
- **Thời lượng ước tính:** 5-6 ngày
- **Trạng thái:** ⏳ Pending
- **Tiến độ:** 0%
- **Phụ thuộc:** Phase 11 (Dashboard Page)

## Mục Tiêu
Thêm interactive features cho widgets (update, delete, edit, pin) và notification system cho daily reminders.

## Deliverables
- [ ] Widget CRUD operations (update progress, delete, edit, pin/unpin)
- [ ] Notification service (cron job)
- [ ] Notification UI (bell icon, dropdown)
- [ ] Settings page cho notifications

---

## Bước 1: Widget Update Progress Modal

### Mục đích
Cho phép user cập nhật progress của manifestation goal.

### Công việc cần làm

1. **Tạo UpdateProgressModal.jsx**

```javascript
// File: frontend/src/components/UpdateProgressModal.jsx

import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function UpdateProgressModal({ widget, goal, onClose, onSuccess }) {
  const [newAmount, setNewAmount] = useState(goal?.current_amount || 0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Update goal
      const { error: goalError } = await supabase
        .from('manifestation_goals')
        .update({
          current_amount: newAmount,
          progress_percentage: (newAmount / goal.target_amount) * 100
        })
        .eq('id', goal.id);

      if (goalError) throw goalError;

      // Update widget data
      const { error: widgetError } = await supabase
        .from('dashboard_widgets')
        .update({
          widget_data: {
            ...widget.widget_data,
            currentAmount: newAmount,
            progress: (newAmount / goal.target_amount) * 100
          }
        })
        .eq('id', widget.id);

      if (widgetError) throw widgetError;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Có lỗi khi cập nhật. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📈 Update Progress</h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Current Amount (VND):</label>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
              placeholder="Enter current amount"
              step="100000"
            />
          </div>

          <div className="progress-preview">
            <p>Target: {goal?.target_amount?.toLocaleString('vi-VN')} VND</p>
            <p>Progress: {((newAmount / goal?.target_amount) * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Files cần tạo
- `frontend/src/components/UpdateProgressModal.jsx`

---

## Bước 2: Widget Delete & Pin Actions

### Công việc cần làm

1. **Add widget actions to widgets**

```javascript
// Update các widget components (GoalCard.jsx, etc.)
// Add these props and handlers

export default function GoalCard({ data, id, preview = false, onUpdate, onDelete, onPin }) {

  return (
    <div className="widget goal-card">
      <div className="widget-header">
        <h3>{data.title}</h3>
        {!preview && (
          <div className="widget-menu">
            <button className="menu-btn" onClick={(e) => {
              e.stopPropagation();
              // Show dropdown menu
            }}>
              ⋯
            </button>

            <div className="menu-dropdown">
              <button onClick={onUpdate}>📈 Update Progress</button>
              <button onClick={onPin}>📌 Pin Widget</button>
              <button onClick={onDelete} className="danger">
                🗑️ Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ... rest of component ... */}
    </div>
  );
}
```

2. **Update Dashboard.jsx với handlers**

```javascript
// Add to Dashboard.jsx

const [showUpdateModal, setShowUpdateModal] = useState(null);

const handleDeleteWidget = async (widgetId) => {
  if (!confirm('Bạn có chắc muốn xóa widget này?')) return;

  try {
    const { error } = await supabase
      .from('dashboard_widgets')
      .update({ is_visible: false })
      .eq('id', widgetId);

    if (error) throw error;

    // Remove from UI
    setWidgets(widgets.filter(w => w.id !== widgetId));
    toast.success('Widget đã được xóa!');
  } catch (error) {
    console.error('Error deleting widget:', error);
    toast.error('Có lỗi khi xóa widget!');
  }
};

const handlePinWidget = async (widgetId) => {
  try {
    const widget = widgets.find(w => w.id === widgetId);

    const { error } = await supabase
      .from('dashboard_widgets')
      .update({ is_pinned: !widget.is_pinned })
      .eq('id', widgetId);

    if (error) throw error;

    // Update UI
    loadWidgets();
    toast.success(widget.is_pinned ? 'Unpinned!' : 'Pinned!');
  } catch (error) {
    console.error('Error pinning widget:', error);
    toast.error('Có lỗi!');
  }
};

// Pass handlers to widgets
const renderWidget = (widget) => {
  const widgetProps = {
    data: widget.widget_data,
    id: widget.id,
    onUpdate: () => setShowUpdateModal(widget),
    onDelete: () => handleDeleteWidget(widget.id),
    onPin: () => handlePinWidget(widget.id)
  };

  // ... existing switch statement ...
};
```

---

## Bước 3: Notification Service (Supabase Edge Function)

### Công việc cần làm

1. **Tạo Edge Function cho notifications**

```typescript
// File: supabase/functions/send-notifications/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get current time
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`

    // Get notifications to send
    const { data: notifications, error } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .eq('is_active', true)
      .lte('next_send_at', now.toISOString())

    if (error) throw error

    console.log(`Found ${notifications?.length || 0} notifications to send`)

    // Send each notification
    for (const notif of notifications || []) {
      // In production, use real notification service (SendGrid, Firebase, etc.)
      console.log(`Sending notification ${notif.id} to user ${notif.user_id}`)

      // Update notification stats
      const nextSend = new Date(notif.next_send_at)
      nextSend.setDate(nextSend.getDate() + 1) // Next day

      await supabase
        .from('scheduled_notifications')
        .update({
          last_sent_at: now.toISOString(),
          next_send_at: nextSend.toISOString(),
          total_sent: notif.total_sent + 1
        })
        .eq('id', notif.id)
    }

    return new Response(
      JSON.stringify({ success: true, sent: notifications?.length || 0 }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

2. **Deploy Edge Function**

```bash
supabase functions deploy send-notifications
```

3. **Setup Cron Job (via Supabase Dashboard)**
   - Go to Database → Cron Jobs
   - Create job: `send-notifications`
   - Schedule: `0 8,12,21 * * *` (8am, 12pm, 9pm daily)
   - Command: `SELECT net.http_post(...)`

---

## Bước 4: Notification UI Component

### Công việc cần làm

1. **Tạo NotificationBell.jsx**

```javascript
// File: frontend/src/components/NotificationBell.jsx

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('next_send_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data || []);

      // Calculate unread (sent but not opened)
      const unread = data?.filter(n =>
        n.last_sent_at && (!n.total_opened || n.total_sent > n.total_opened)
      ).length || 0;

      setUnreadCount(unread);

    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsOpened = async (notifId) => {
    try {
      const notif = notifications.find(n => n.id === notifId);

      await supabase
        .from('scheduled_notifications')
        .update({
          total_opened: (notif.total_opened || 0) + 1
        })
        .eq('id', notifId);

      loadNotifications();
    } catch (error) {
      console.error('Error marking notification:', error);
    }
  };

  return (
    <div className="notification-bell">
      <button
        className="bell-btn"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h4>🔔 Notifications</h4>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="empty-message">No notifications yet</p>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`notification-item ${
                    notif.total_sent > (notif.total_opened || 0) ? 'unread' : ''
                  }`}
                  onClick={() => {
                    markAsOpened(notif.id);
                    if (notif.action_url) {
                      window.location.href = notif.action_url;
                    }
                  }}
                >
                  <div className="notif-title">{notif.title}</div>
                  <div className="notif-message">{notif.message}</div>
                  <div className="notif-time">
                    {new Date(notif.next_send_at).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

2. **Add NotificationBell to TopNavBar**

```javascript
// In TopNavBar.jsx
import NotificationBell from './NotificationBell';

// Add to nav bar
<NotificationBell />
```

### Files cần tạo
- `frontend/src/components/NotificationBell.jsx`
- `frontend/src/styles/notifications.css`

---

## Bước 5: Testing

### Manual Testing Checklist
- [ ] Update widget progress works
- [ ] Delete widget works (soft delete)
- [ ] Pin/unpin widget works
- [ ] Notification cron job runs
- [ ] Notifications appear in bell dropdown
- [ ] Click notification navigates to action_url
- [ ] Unread count shows correctly
- [ ] Mark as read works

---

## Edge Cases & Error Handling

### Edge Cases

1. **Notification service down**
   - Giải pháp: Queue notifications, retry mechanism

2. **User deletes goal but notifications still exist**
   - Giải pháp: Cascade delete or disable notifications when goal deleted

3. **Timezone issues**
   - Giải pháp: Store all times in UTC, convert to user timezone for display

---

## Completion Criteria

Phase 12 hoàn thành khi:
- [ ] Widget update/delete/pin works
- [ ] Notification edge function deployed
- [ ] Cron job scheduled
- [ ] Notification UI works
- [ ] Unread count accurate
- [ ] Tests pass

---

## Next Steps

1. Update `plan.md`: Phase 12 = ✅
2. Commit: `feat: complete phase-12 - interactions & notifications`
3. Review
4. Sang phase-13 (final phase)
