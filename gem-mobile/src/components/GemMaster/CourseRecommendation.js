// src/components/GemMaster/CourseRecommendation.js
// Course Recommendation Component

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
} from 'react-native';
import { GraduationCap, ChevronRight, Check } from 'lucide-react-native';

const CourseRecommendation = ({ course, onPress }) => {
  if (!course) return null;

  const handlePress = () => {
    if (onPress) {
      onPress(course);
    } else if (course.url) {
      Linking.openURL(course.url);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GraduationCap size={18} color="#FFBD59" />
        <Text style={styles.headerText}>Khóa học gợi ý cho bạn</Text>
      </View>

      {/* Course Card */}
      <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
        {/* Image */}
        {course.image && (
          <Image
            source={{ uri: course.image }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Badge */}
          {course.discount && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{course.discount}</Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.subtitle}>{course.subtitle}</Text>

          {/* Benefits */}
          {course.benefits && (
            <View style={styles.benefits}>
              {course.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <Check size={14} color="#10B981" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{course.price}</Text>
            {course.originalPrice && (
              <Text style={styles.originalPrice}>{course.originalPrice}</Text>
            )}
          </View>

          {/* CTA Button */}
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>Xem chi tiết</Text>
            <ChevronRight size={16} color="#0A0F1C" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFBD59',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#1A202C',
  },
  content: {
    padding: 16,
  },
  badge: {
    position: 'absolute',
    top: -140 + 12,
    right: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#A0AEC0',
    marginBottom: 12,
  },
  benefits: {
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 13,
    color: '#E2E8F0',
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFBD59',
  },
  originalPrice: {
    fontSize: 14,
    color: '#718096',
    textDecorationLine: 'line-through',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFBD59',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 4,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0F1C',
  },
});

export default CourseRecommendation;
