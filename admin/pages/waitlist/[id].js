/**
 * Waitlist Entry Detail Page
 * Chi tiet mot entry trong waitlist
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../services/api';

const statusColors = {
  pending: 'bg-yellow-500',
  verified: 'bg-blue-500',
  nurturing: 'bg-purple-500',
  completed: 'bg-green-500',
  converted: 'bg-amber-500',
  unsubscribed: 'bg-gray-500',
  invalid: 'bg-red-500',
};

const statusLabels = {
  pending: 'Chờ xác minh',
  verified: 'Đã kết nối',
  nurturing: 'Đang nurturing',
  completed: 'Hoàn thành',
  converted: 'Đã convert',
  unsubscribed: 'Đã hủy',
  invalid: 'Không hợp lệ',
};

const messageTypeLabels = {
  welcome: 'Chào mừng',
  nurturing: 'Nurturing',
  launch: 'Ra mắt',
  broadcast: 'Broadcast',
};

export default function WaitlistDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [entry, setEntry] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [zaloIdInput, setZaloIdInput] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [entryRes, messagesRes] = await Promise.all([
        api.getWaitlistEntry(id),
        api.getWaitlistMessageLog(id),
      ]);
      setEntry(entryRes);
      setMessages(messagesRes.messages || []);
    } catch (error) {
      console.error('Error loading entry:', error);
      if (error.message.includes('404')) {
        router.push('/waitlist');
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResendWelcome = async () => {
    setActionLoading('welcome');
    try {
      await api.resendWelcome(id);
      alert('Đã gửi lại tin chào mừng');
      loadData();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendNurturing = async (stage) => {
    setActionLoading(`nurturing-${stage}`);
    try {
      await api.sendNurturing(id, stage);
      alert(`Đã gửi nurturing stage ${stage}`);
      loadData();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLinkZalo = async () => {
    if (!zaloIdInput.trim()) {
      alert('Vui lòng nhập Zalo ID');
      return;
    }

    setActionLoading('link');
    try {
      await api.manualLinkZalo(id, zaloIdInput.trim());
      alert('Đã liên kết Zalo thành công');
      setShowLinkModal(false);
      setZaloIdInput('');
      loadData();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!confirm(`Bạn có chắc muốn chuyển trạng thái sang "${statusLabels[newStatus]}"?`)) return;

    setActionLoading('status');
    try {
      await api.updateWaitlistEntryStatus(id, newStatus);
      loadData();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4" />
          <div className="h-64 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Không tìm thấy entry</p>
        <Link href="/waitlist" className="text-amber-500 hover:underline mt-2 inline-block">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/waitlist"
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              #{entry.queue_number} - {entry.name || entry.zalo_display_name || 'Chưa có tên'}
            </h1>
            <p className="text-gray-400 mt-1">
              Đăng ký lúc {new Date(entry.created_at).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[entry.status]
            }/20`}
          >
            <span className={`w-2 h-2 rounded-full ${statusColors[entry.status]} mr-2`} />
            {statusLabels[entry.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Thông tin cơ bản</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm">Số điện thoại</p>
                <p className="text-white font-mono mt-1">{entry.phone || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Mã giới thiệu</p>
                <p className="text-amber-500 font-mono mt-1">{entry.referral_code}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Số người đã giới thiệu</p>
                <p className="text-white mt-1">{entry.referral_count || 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Được giới thiệu bởi</p>
                <p className="text-white mt-1">{entry.referred_by || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">UTM Source</p>
                <p className="text-white mt-1">{entry.utm_source || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">UTM Campaign</p>
                <p className="text-white mt-1">{entry.utm_campaign || '—'}</p>
              </div>
            </div>
          </div>

          {/* Zalo Info */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Kết nối Zalo</h3>
              {!entry.zalo_user_id && (
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Liên kết thủ công
                </button>
              )}
            </div>

            {entry.zalo_user_id ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm">Zalo User ID</p>
                  <p className="text-white font-mono mt-1 text-sm">{entry.zalo_user_id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Tên hiển thị</p>
                  <p className="text-white mt-1">{entry.zalo_display_name || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Kết nối lúc</p>
                  <p className="text-white mt-1">
                    {entry.zalo_connected_at
                      ? new Date(entry.zalo_connected_at).toLocaleString('vi-VN')
                      : '—'}
                  </p>
                </div>
                {entry.zalo_avatar_url && (
                  <div>
                    <p className="text-gray-400 text-sm">Avatar</p>
                    <img
                      src={entry.zalo_avatar_url}
                      alt="Zalo avatar"
                      className="w-10 h-10 rounded-full mt-1"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Chưa kết nối Zalo</p>
            )}
          </div>

          {/* Nurturing Progress */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tiến trình Nurturing</h3>

            <div className="space-y-4">
              {[
                { stage: 1, label: 'Day 0 - Welcome', days: 0 },
                { stage: 2, label: 'Day 3 - Value', days: 3 },
                { stage: 3, label: 'Day 7 - Feature', days: 7 },
                { stage: 4, label: 'Day 10 - Social Proof', days: 10 },
                { stage: 5, label: 'Day 14 - Urgency', days: 14 },
              ].map((item) => (
                <div
                  key={item.stage}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.nurturing_stage >= item.stage ? 'bg-purple-500/10' : 'bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        entry.nurturing_stage >= item.stage
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-600 text-gray-400'
                      }`}
                    >
                      {entry.nurturing_stage >= item.stage ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm">{item.stage}</span>
                      )}
                    </div>
                    <span className={entry.nurturing_stage >= item.stage ? 'text-white' : 'text-gray-400'}>
                      {item.label}
                    </span>
                  </div>

                  {entry.zalo_user_id && entry.nurturing_stage < item.stage && (
                    <button
                      onClick={() => handleSendNurturing(item.stage)}
                      disabled={actionLoading === `nurturing-${item.stage}`}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === `nurturing-${item.stage}` ? 'Đang gửi...' : 'Gửi'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {entry.next_nurturing_at && (
              <p className="text-gray-400 text-sm mt-4">
                Nurturing tiếp theo: {new Date(entry.next_nurturing_at).toLocaleString('vi-VN')}
              </p>
            )}
          </div>

          {/* Message Log */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Lịch sử tin nhắn</h3>

            {messages.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      msg.status === 'sent' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-300">
                          {messageTypeLabels[msg.message_type] || msg.message_type}
                        </span>
                        {msg.stage > 0 && (
                          <span className="text-xs text-purple-400">Stage {msg.stage}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs ${
                            msg.status === 'sent' ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {msg.status === 'sent' ? 'Đã gửi' : 'Thất bại'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.sent_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.error_message && (
                      <p className="text-red-400 text-xs mt-2">{msg.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Chưa có tin nhắn nào</p>
            )}
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Hành động</h3>

            <div className="space-y-3">
              {entry.zalo_user_id && (
                <button
                  onClick={handleResendWelcome}
                  disabled={actionLoading === 'welcome'}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'welcome' ? 'Đang gửi...' : 'Gửi lại tin chào mừng'}
                </button>
              )}

              {!entry.zalo_user_id && (
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Liên kết Zalo thủ công
                </button>
              )}

              {entry.status !== 'converted' && entry.zalo_user_id && (
                <button
                  onClick={() => handleUpdateStatus('converted')}
                  disabled={actionLoading === 'status'}
                  className="w-full px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  Đánh dấu đã Convert
                </button>
              )}

              {entry.status !== 'unsubscribed' && (
                <button
                  onClick={() => handleUpdateStatus('unsubscribed')}
                  disabled={actionLoading === 'status'}
                  className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Đánh dấu đã hủy
                </button>
              )}
            </div>
          </div>

          {/* Status Change */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Đổi trạng thái</h3>

            <select
              value={entry.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              disabled={actionLoading === 'status'}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="pending">Chờ xác minh</option>
              <option value="verified">Đã kết nối</option>
              <option value="nurturing">Đang nurturing</option>
              <option value="completed">Hoàn thành</option>
              <option value="converted">Đã convert</option>
              <option value="unsubscribed">Đã hủy</option>
              <option value="invalid">Không hợp lệ</option>
            </select>
          </div>

          {/* Launch Notification */}
          {entry.zalo_user_id && !entry.launch_notified_at && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Thông báo ra mắt</h3>
              <p className="text-gray-400 text-sm mb-4">
                Entry này chưa được gửi thông báo ra mắt app.
              </p>
              <button
                onClick={async () => {
                  setActionLoading('launch');
                  try {
                    await api.triggerLaunch(1);
                    alert('Đã gửi thông báo ra mắt');
                    loadData();
                  } catch (error) {
                    alert('Lỗi: ' + error.message);
                  } finally {
                    setActionLoading(null);
                  }
                }}
                disabled={actionLoading === 'launch'}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'launch' ? 'Đang gửi...' : 'Gửi thông báo ra mắt'}
              </button>
            </div>
          )}

          {entry.launch_notified_at && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Đã thông báo ra mắt</h3>
              <p className="text-green-400 text-sm">
                {new Date(entry.launch_notified_at).toLocaleString('vi-VN')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Link Zalo Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Liên kết Zalo thủ công</h3>

            <p className="text-gray-400 text-sm mb-4">
              Nhập Zalo User ID để liên kết với entry này. Zalo User ID có thể lấy từ webhook logs.
            </p>

            <input
              type="text"
              value={zaloIdInput}
              onChange={(e) => setZaloIdInput(e.target.value)}
              placeholder="Nhập Zalo User ID..."
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setZaloIdInput('');
                }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleLinkZalo}
                disabled={actionLoading === 'link'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'link' ? 'Đang liên kết...' : 'Liên kết'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
