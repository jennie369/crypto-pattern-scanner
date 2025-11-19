import React from 'react';
import { MessageCircle, Smartphone, Send, HelpCircle } from 'lucide-react';
import './CSKHButtons.css';

export const CSKHButtons = ({ placement = 'sidebar' }) => {
  const cskh = [
    {
      name: 'Facebook',
      Icon: MessageCircle,
      url: 'https://www.facebook.com/yinyangmasterscrystals/',
      color: '#1877F2'
    },
    {
      name: 'Zalo',
      Icon: Smartphone,
      url: 'https://zalo.me/0787238002',
      color: '#0068FF'
    },
    {
      name: 'Telegram',
      Icon: Send,
      url: 'https://t.me/gemholdingchannel',
      color: '#0088CC'
    }
  ];

  return (
    <div className={`cskh-buttons ${placement}`}>
      <h4 className="cskh-title">
        <HelpCircle size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
        Cần hỗ trợ?
      </h4>
      {cskh.map(channel => {
        const IconComponent = channel.Icon;
        return (
          <a
            key={channel.name}
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cskh-btn"
            style={{ '--cskh-color': channel.color }}
          >
            <IconComponent className="cskh-icon" size={20} strokeWidth={2} />
            <span className="cskh-text">Chat qua {channel.name}</span>
          </a>
        );
      })}
    </div>
  );
};

export default CSKHButtons;
