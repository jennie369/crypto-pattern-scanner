/**
 * FAQPanel - Web component
 * Slide-up panel with topic navigation, search, and question list.
 * Ported from gem-mobile/src/components/GemMaster/FAQPanel.js
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Search } from 'lucide-react';
import { ANIMATION } from '../../../../web design-tokens';
import { FAQ_TOPICS, FAQ_QUESTIONS, getTopicById, getQuestionsForTopic } from './FAQPanelData';
import './FAQPanel.css';

const FAQPanel = ({
  isOpen,
  onClose,
  onSelectQuestion,
  initialTopicId = null,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopicId);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedTopicId(initialTopicId);
      setSearchQuery('');
      // Focus search after animation
      setTimeout(() => searchRef.current?.focus(), 350);
    }
  }, [isOpen, initialTopicId]);

  // Filter FAQ topics to only those with show_faq action
  const faqTopics = useMemo(
    () => FAQ_TOPICS.filter((t) => t.action === 'show_faq'),
    []
  );

  // Get questions based on selection and search
  const questions = useMemo(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const allQuestions = [];
      Object.entries(FAQ_QUESTIONS).forEach(([topicId, qs]) => {
        qs.forEach((q) => {
          if (q.text.toLowerCase().includes(query)) {
            allQuestions.push({ ...q, topicId });
          }
        });
      });
      return allQuestions;
    }
    if (selectedTopicId) {
      return getQuestionsForTopic(selectedTopicId);
    }
    return [];
  }, [selectedTopicId, searchQuery]);

  const selectedTopic = selectedTopicId ? getTopicById(selectedTopicId) : null;

  const handleQuestionClick = (question) => {
    onSelectQuestion?.(question);
    onClose?.();
  };

  const handleTopicClick = (topicId) => {
    setSelectedTopicId(topicId === selectedTopicId ? null : topicId);
    setSearchQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose?.();
  };

  const panelTitle = searchQuery
    ? `Ket qua: "${searchQuery}"`
    : selectedTopic
      ? selectedTopic.label
      : 'Cau hoi thuong gap';

  const TopicIcon = selectedTopic?.Icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="faq-panel-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="FAQ Panel"
        >
          <motion.div
            className="faq-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="faq-panel-header">
              <div className="faq-panel-header-left">
                <div className="faq-panel-icon">
                  {TopicIcon ? (
                    <TopicIcon size={20} color="#8B5CF6" />
                  ) : (
                    <Search size={20} color="#8B5CF6" />
                  )}
                </div>
                <h3 className="faq-panel-title">{panelTitle}</h3>
              </div>
              <button
                className="faq-panel-close"
                onClick={onClose}
                aria-label="Close FAQ panel"
              >
                <X size={22} color="rgba(255,255,255,0.6)" />
              </button>
            </div>

            <div className="faq-panel-divider" />

            {/* Search */}
            <div className="faq-panel-search">
              <input
                ref={searchRef}
                className="faq-panel-search-input"
                type="text"
                placeholder="Tim kiem cau hoi..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) setSelectedTopicId(null);
                }}
              />
            </div>

            {/* Topic pills */}
            {!searchQuery && (
              <div className="faq-panel-topics">
                {faqTopics.map((topic) => {
                  const Icon = topic.Icon;
                  return (
                    <button
                      key={topic.id}
                      className={`faq-panel-topic-btn ${selectedTopicId === topic.id ? 'faq-panel-topic-btn--active' : ''}`}
                      onClick={() => handleTopicClick(topic.id)}
                    >
                      <Icon size={14} color={selectedTopicId === topic.id ? '#8B5CF6' : topic.color} />
                      {topic.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Questions */}
            <div className="faq-panel-questions">
              {questions.length === 0 && (
                <div className="faq-panel-empty">
                  {searchQuery
                    ? 'Khong tim thay cau hoi phu hop.'
                    : 'Chon chu de de xem cau hoi.'}
                </div>
              )}
              {questions.map((question, index) => (
                <React.Fragment key={question.id}>
                  <motion.div
                    className="faq-panel-question"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleQuestionClick(question)}
                  >
                    <span className="faq-panel-question-text">{question.text}</span>
                    {question.tag && (
                      <span className="faq-panel-question-tag">{question.tag}</span>
                    )}
                    <ChevronRight size={18} color="#8B5CF6" style={{ opacity: 0.7, flexShrink: 0 }} />
                  </motion.div>
                  {index < questions.length - 1 && (
                    <div className="faq-panel-question-divider" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FAQPanel;
