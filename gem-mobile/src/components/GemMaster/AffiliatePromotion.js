// src/components/GemMaster/AffiliatePromotion.js
// Affiliate/CTV Promotion Component

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Users, ChevronRight, Gift, TrendingUp } from 'lucide-react-native';

const AffiliatePromotion = ({ promo, onPress }) => {
  if (!promo) return null;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (promo.url) {
      Linking.openURL(promo.url);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Users size={18} color="#10B981" />
        <Text style={styles.headerText}>Cơ hội hợp tác</Text>
      </View>

      {/* Promo Card */}
      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.title}>{promo.title}</Text>
        <Text style={styles.description}>{promo.description}</Text>

        {/* Tiers */}
        <View style={styles.tiersContainer}>
          {promo.tiers?.map((tier, index) => (
            <View key={index} style={[styles.tierRow, index === promo.tiers.length - 1 && styles.tierHighlight]}>
              <View style={styles.tierLeft}>
                <Gift size={14} color={index === promo.tiers.length - 1 ? '#FFBD59' : '#718096'} />
                <Text style={[styles.tierName, index === promo.tiers.length - 1 && styles.tierNameHighlight]}>
                  {tier.name}
                </Text>
              </View>
              <View style={styles.tierRight}>
                <TrendingUp size={12} color="#10B981" />
                <Text style={styles.tierCommission}>{tier.commission}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.ctaButton} onPress={handlePress}>
          <Text style={styles.ctaText}>{promo.cta || 'Đăng ký ngay'}</Text>
          <ChevronRight size={16} color="#0A0F1C" />
        </TouchableOpacity>
      </View>
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
    color: '#10B981',
  },
  card: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#A0AEC0',
    marginBottom: 16,
  },
  tiersContainer: {
    marginBottom: 16,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    marginBottom: 6,
  },
  tierHighlight: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  tierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierName: {
    fontSize: 13,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  tierNameHighlight: {
    color: '#FFBD59',
    fontWeight: '600',
  },
  tierRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tierCommission: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
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

export default AffiliatePromotion;
