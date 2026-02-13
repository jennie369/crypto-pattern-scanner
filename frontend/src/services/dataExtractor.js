// DataExtractor Service
// Extracts structured data from AI responses (goal title, target amount, timeline, affirmations, etc.)

export class DataExtractor {

  /**
   * Extract manifestation goal data
   */
  extractManifestationData(aiResponse) {
    return {
      goalTitle: this.extractTitle(aiResponse),
      targetAmount: this.extractAmount(aiResponse),
      timeline: this.extractTimeline(aiResponse),
      affirmations: this.extractAffirmations(aiResponse),
      actionSteps: this.extractActionSteps(aiResponse),
      crystalRecommendations: this.extractCrystals(aiResponse)
    };
  }

  /**
   * Extract goal title
   */
  extractTitle(text) {
    const patterns = [
      /🎯\s*MỤC TIÊU\s*[:：]?\s*([^\n]+)/i,
      /manifest\s+([^.!?\n]+)/i,
      /mục tiêu\s*[:：]?\s*([^.!?\n]+)/i,
      /goal\s*[:：]?\s*([^.!?\n]+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return 'Mục tiêu mới';
  }

  /**
   * Extract monetary amount
   */
  extractAmount(text) {
    const patterns = [
      /💰\s*Target\s*[:：]?\s*([0-9,\.]+)\s*(triệu|million|m|vnd)/i,
      /(\d{1,3}(?:[,\.]\d{3})+)\s*(triệu|million|m)/i,
      /(\d+)\s*(triệu|million|m)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const num = parseFloat(match[1].replace(/[,\.]/g, ''));

        if (match[2] && (match[2].toLowerCase().includes('triệu') || match[2].toLowerCase().includes('m'))) {
          return num * 1000000;
        }

        return num;
      }
    }

    return null;
  }

  /**
   * Extract timeline
   */
  extractTimeline(text) {
    const patterns = [
      /📅\s*Timeline\s*[:：]?\s*(\d+)\s*(tháng|month|months)/i,
      /(\d+)\s*(tháng|month|months)/i,
      /(\d+)\s*(tuần|week|weeks)/i,
      /(\d+)\s*(ngày|day|days)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const num = parseInt(match[1]);

        if (match[2].toLowerCase().includes('tháng') || match[2].toLowerCase().includes('month')) {
          return { months: num };
        }
        if (match[2].toLowerCase().includes('tuần') || match[2].toLowerCase().includes('week')) {
          return { weeks: num };
        }
        if (match[2].toLowerCase().includes('ngày') || match[2].toLowerCase().includes('day')) {
          return { days: num };
        }
      }
    }

    return { months: 6 }; // Default 6 months
  }

  /**
   * Extract affirmations (lines starting with ✨, •, -, or numbers)
   */
  extractAffirmations(text) {
    const lines = text.split('\n');
    const affirmations = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Match patterns: ✨ "text", • "text", - "text", 1. "text"
      const patterns = [
        /^✨\s*["'](.+?)["']$/,
        /^✨\s*(.+)$/,
        /^•\s*["'](.+?)["']$/,
        /^•\s*(.+)$/,
        /^-\s*["'](.+?)["']$/,
        /^-\s*(.+)$/,
        /^\d+\.\s*["'](.+?)["']$/,
        /^\d+\.\s*(.+)$/
      ];

      for (const pattern of patterns) {
        const match = trimmed.match(pattern);
        if (match && match[1] && match[1].length > 10) {
          const cleaned = match[1].replace(/^["']|["']$/g, '').trim();
          if (cleaned.length > 10) {
            affirmations.push(cleaned);
            break;
          }
        }
      }
    }

    return affirmations.slice(0, 10); // Max 10 affirmations
  }

  /**
   * Extract action plan steps
   */
  extractActionSteps(text) {
    const steps = [];
    const sections = text.split(/Week\s+(\d+)[:：]?|Tuần\s+(\d+)[:：]?/i);

    for (let i = 1; i < sections.length; i += 3) {
      const weekNum = sections[i] || sections[i + 1];
      const content = sections[i + 2] || sections[i + 1] || '';

      if (!weekNum || !content) continue;

      const lines = content.split('\n');
      const tasks = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.match(/^\d+\./)) {
          const cleaned = trimmed.replace(/^[•\-\d.]+\s*/, '').trim();
          if (cleaned && cleaned.length > 5) {
            tasks.push(cleaned);
          }
        }
      }

      if (tasks.length > 0) {
        steps.push({
          week: parseInt(weekNum),
          tasks: tasks
        });
      }
    }

    return steps;
  }

  /**
   * Extract crystal recommendations
   */
  extractCrystals(text) {
    const crystals = [];
    const lines = text.split('\n');
    let inCrystalSection = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (/💎\s*CRYSTALS?/i.test(trimmed) || /CRYSTAL.*RECOMMENDATION/i.test(trimmed)) {
        inCrystalSection = true;
        continue;
      }

      if (inCrystalSection) {
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          const cleaned = trimmed.replace(/^[•\-]+\s*/, '').trim();
          if (cleaned) {
            crystals.push(cleaned);
          }
        } else if (trimmed === '' || /^[#\*]/.test(trimmed)) {
          // End of crystal section
          break;
        }
      }
    }

    return crystals.slice(0, 5); // Max 5 crystals
  }
}
