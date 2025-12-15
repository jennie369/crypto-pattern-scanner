/**
 * Regenerate Seed Data Script
 * Deletes all existing seed content and generates fresh users + posts
 *
 * Run with: node scripts/regenerateSeedData.js
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Generate UUID v4
function generateUUID() {
  return crypto.randomUUID();
}

// Supabase config
const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzc1MzYsImV4cCI6MjA3Nzc1MzUzNn0.1De0-m3GhFHUrKl-ViqX_r6bydVFoWDaW8DsxhhbjEc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuration
const CONFIG = {
  premiumUsers: 100,
  regularUsers: 200,
  postsPerPremiumUser: { min: 5, max: 10 },
  postsPerRegularUser: { min: 0, max: 5 },
  backdateDays: 30,
};

/**
 * Delete all seed content from database
 */
async function deleteAllSeedContent() {
  console.log('\n='.repeat(60));
  console.log('DELETING ALL SEED CONTENT');
  console.log('='.repeat(60));

  try {
    // First get all seed user IDs
    console.log('Fetching seed user IDs...');
    const { data: seedUsers, error: seedUsersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_seed_user', true);

    if (seedUsersError) {
      console.error('Error fetching seed users:', seedUsersError);
    }

    const seedUserIds = seedUsers?.map(u => u.id) || [];
    console.log(`Found ${seedUserIds.length} seed users`);

    // Get all seed post IDs
    console.log('Fetching seed post IDs...');
    const { data: seedPosts, error: seedPostsError } = await supabase
      .from('forum_posts')
      .select('id')
      .eq('is_seed_post', true);

    if (seedPostsError) {
      console.error('Error fetching seed posts:', seedPostsError);
    }

    const seedPostIds = seedPosts?.map(p => p.id) || [];
    console.log(`Found ${seedPostIds.length} seed posts`);

    // Delete in order to avoid foreign key issues
    let deletedComments = 0;
    let deletedLikes = 0;
    let deletedPosts = 0;
    let deletedUsers = 0;

    // 1. Delete comments on seed posts
    if (seedPostIds.length > 0) {
      console.log('Deleting comments on seed posts...');
      const { error, count } = await supabase
        .from('forum_comments')
        .delete({ count: 'exact' })
        .in('post_id', seedPostIds);

      if (error) console.error('Error deleting comments:', error);
      else deletedComments += count || 0;
    }

    // 2. Delete comments by seed users
    if (seedUserIds.length > 0) {
      console.log('Deleting comments by seed users...');
      const { error, count } = await supabase
        .from('forum_comments')
        .delete({ count: 'exact' })
        .in('author_id', seedUserIds);

      if (error) console.error('Error deleting comments by seed users:', error);
      else deletedComments += count || 0;
    }

    // 3. Delete likes on seed posts
    if (seedPostIds.length > 0) {
      console.log('Deleting likes on seed posts...');
      const { error, count } = await supabase
        .from('forum_likes')
        .delete({ count: 'exact' })
        .in('post_id', seedPostIds);

      if (error) console.error('Error deleting likes:', error);
      else deletedLikes += count || 0;
    }

    // 4. Delete likes by seed users
    if (seedUserIds.length > 0) {
      console.log('Deleting likes by seed users...');
      const { error, count } = await supabase
        .from('forum_likes')
        .delete({ count: 'exact' })
        .in('user_id', seedUserIds);

      if (error) console.error('Error deleting likes by seed users:', error);
      else deletedLikes += count || 0;
    }

    // 5. Delete seed posts
    console.log('Deleting seed posts...');
    const { error: postsError, count: postsCount } = await supabase
      .from('forum_posts')
      .delete({ count: 'exact' })
      .eq('is_seed_post', true);

    if (postsError) console.error('Error deleting posts:', postsError);
    else deletedPosts = postsCount || 0;

    // 6. Delete seed users
    console.log('Deleting seed users...');
    const { error: usersError, count: usersCount } = await supabase
      .from('profiles')
      .delete({ count: 'exact' })
      .eq('is_seed_user', true);

    if (usersError) console.error('Error deleting users:', usersError);
    else deletedUsers = usersCount || 0;

    // 7. Clear bot activity log
    console.log('Clearing bot activity log...');
    await supabase
      .from('bot_activity_log')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('\n--- DELETION SUMMARY ---');
    console.log(`Deleted ${deletedUsers} seed users`);
    console.log(`Deleted ${deletedPosts} seed posts`);
    console.log(`Deleted ${deletedComments} comments`);
    console.log(`Deleted ${deletedLikes} likes`);

    return {
      deletedUsers,
      deletedPosts,
      deletedComments,
      deletedLikes,
    };
  } catch (error) {
    console.error('Error in deleteAllSeedContent:', error);
    throw error;
  }
}

/**
 * Generate a random Vietnamese name
 */
function generateVietnameseName(gender) {
  const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
  const middleNames = ['Văn', 'Thị', 'Đức', 'Ngọc', 'Minh', 'Thành', 'Hoàng', 'Kim', 'Thanh', 'Xuân'];
  const maleFirstNames = ['Anh', 'Bình', 'Cường', 'Dũng', 'Đức', 'Hải', 'Hiếu', 'Hoàng', 'Hùng', 'Khải', 'Long', 'Minh', 'Nam', 'Phong', 'Quang', 'Sơn', 'Thắng', 'Thiện', 'Toàn', 'Trung', 'Tuấn', 'Việt'];
  const femaleFirstNames = ['Anh', 'Chi', 'Diễm', 'Hà', 'Hạnh', 'Hương', 'Khánh', 'Lan', 'Linh', 'Mai', 'My', 'Ngọc', 'Nhung', 'Phương', 'Quỳnh', 'Thảo', 'Thu', 'Trang', 'Trinh', 'Vân', 'Yến'];

  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
  const firstNames = gender === 'female' ? femaleFirstNames : maleFirstNames;
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];

  return `${lastName} ${middleName} ${firstName}`;
}

/**
 * Generate a random bio based on persona
 */
function generateBio(persona, isPremium) {
  const bios = {
    trader: [
      '📈 Trader chuyên nghiệp | Phân tích kỹ thuật',
      '💹 Crypto & Forex Trader | 5+ năm kinh nghiệm',
      '🔥 Full-time trader | Chia sẻ kiến thức giao dịch',
    ],
    crystal_lover: [
      '💎 Yêu đá phong thủy | Sưu tập đá quý',
      '✨ Crystal healer | Năng lượng tích cực',
      '🔮 Đam mê đá tự nhiên | Phong thủy & tâm linh',
    ],
    spiritual: [
      '🧘 Thiền định & Mindfulness | Inner peace',
      '🌟 Law of Attraction | Manifestation',
      '✨ Tư duy tích cực | Phát triển bản thân',
    ],
    investor: [
      '💰 Đầu tư dài hạn | Tự do tài chính',
      '📊 Value Investor | Warren Buffett follower',
      '🎯 Passive income | Financial freedom',
    ],
    educator: [
      '📚 Chia sẻ kiến thức | Học không bao giờ đủ',
      '🎓 Mentor & Coach | Giúp người khác thành công',
      '💡 Lifelong learner | Phát triển bản thân',
    ],
    affiliate: [
      '🤝 Affiliate marketer | Passive income',
      '💼 Business builder | Network marketing',
      '🚀 Entrepreneur | Digital marketing',
    ],
  };

  const personaBios = bios[persona] || bios.trader;
  return personaBios[Math.floor(Math.random() * personaBios.length)];
}

/**
 * Generate seed users
 */
async function generateSeedUsers() {
  console.log('\n='.repeat(60));
  console.log('GENERATING SEED USERS');
  console.log('='.repeat(60));

  const personas = ['trader', 'crystal_lover', 'spiritual', 'investor', 'educator', 'affiliate'];
  const users = [];
  const totalUsers = CONFIG.premiumUsers + CONFIG.regularUsers;

  console.log(`Generating ${CONFIG.premiumUsers} premium + ${CONFIG.regularUsers} regular users...`);

  for (let i = 0; i < totalUsers; i++) {
    const isPremium = i < CONFIG.premiumUsers;
    const gender = Math.random() > 0.5 ? 'female' : 'male';
    const persona = personas[Math.floor(Math.random() * personas.length)];

    const uniqueId = generateUUID();
    const user = {
      id: uniqueId,
      email: `seed_${uniqueId.slice(0, 8)}@gemral.bot`,
      full_name: generateVietnameseName(gender),
      bio: generateBio(persona, isPremium),
      avatar_url: null, // Will be set from SAMPLE_AVATARS in app
      is_seed_user: true,
      is_premium_seed: isPremium,
      seed_persona: persona,
      bot_enabled: true,
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random date within 90 days
    };

    users.push(user);

    if ((i + 1) % 50 === 0) {
      console.log(`Generated ${i + 1}/${totalUsers} user profiles...`);
    }
  }

  // Insert users in batches
  console.log('Inserting users into database...');
  const batchSize = 50;
  let insertedCount = 0;

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('profiles')
      .insert(batch)
      .select('id, is_premium_seed, seed_persona');

    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
    } else {
      insertedCount += data?.length || 0;
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}`);
    }
  }

  console.log(`\nTotal users inserted: ${insertedCount}`);
  return insertedCount;
}

/**
 * Generate seed posts
 */
async function generateSeedPosts() {
  console.log('\n='.repeat(60));
  console.log('GENERATING SEED POSTS');
  console.log('='.repeat(60));

  // First, get all seed users
  const { data: seedUsers, error: usersError } = await supabase
    .from('profiles')
    .select('id, is_premium_seed, seed_persona')
    .eq('is_seed_user', true);

  if (usersError) {
    console.error('Error fetching seed users:', usersError);
    return 0;
  }

  console.log(`Found ${seedUsers.length} seed users to generate posts for`);

  const topics = ['trading', 'crystal', 'loa', 'education', 'wealth', 'affiliate'];
  const posts = [];

  for (const user of seedUsers) {
    const isPremium = user.is_premium_seed;
    const postsRange = isPremium ? CONFIG.postsPerPremiumUser : CONFIG.postsPerRegularUser;
    const numPosts = Math.floor(Math.random() * (postsRange.max - postsRange.min + 1)) + postsRange.min;

    for (let j = 0; j < numPosts; j++) {
      // Map persona to topic, with some randomness
      let topic = user.seed_persona;
      if (Math.random() > 0.7) {
        topic = topics[Math.floor(Math.random() * topics.length)];
      }
      if (topic === 'crystal_lover') topic = 'crystal';
      if (topic === 'spiritual') topic = 'loa';
      if (topic === 'investor') topic = 'wealth';

      const backdateMs = Math.random() * CONFIG.backdateDays * 24 * 60 * 60 * 1000;

      const post = {
        author_id: user.id,
        content: generatePostContent(topic),
        images: [], // Will be filled with URLs from SAMPLE_IMAGES in the app
        seed_topic: topic,
        is_seed_post: true,
        likes_count: Math.floor(Math.random() * (isPremium ? 500 : 100)) + 5,
        comments_count: Math.floor(Math.random() * (isPremium ? 50 : 15)) + 1,
        shares_count: Math.floor(Math.random() * 20),
        created_at: new Date(Date.now() - backdateMs).toISOString(),
      };

      posts.push(post);
    }
  }

  console.log(`Total posts to insert: ${posts.length}`);

  // Insert posts in batches
  const batchSize = 100;
  let insertedCount = 0;

  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('forum_posts')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(`Error inserting post batch ${Math.floor(i / batchSize) + 1}:`, error);
    } else {
      insertedCount += data?.length || 0;
      console.log(`Inserted post batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(posts.length / batchSize)}`);
    }
  }

  console.log(`\nTotal posts inserted: ${insertedCount}`);
  return insertedCount;
}

/**
 * Generate sample post content
 */
function generatePostContent(topic) {
  const contents = {
    trading: [
      'BTC đang test vùng hỗ trợ quan trọng. Nếu giữ được, khả năng cao sẽ có một đợt tăng mạnh. Các bạn theo dõi kỹ nhé! 📈💹',
      'Hôm nay có setup DPD khá đẹp trên ETH. Đã vào lệnh với SL chặt. Chia sẻ để anh em tham khảo! 🎯',
      'Phân tích kỹ thuật: BTCUSDT đang hình thành mẫu hình tích lũy. Breakout sắp xảy ra! 🔥',
      'Thị trường sideway, kiên nhẫn chờ tín hiệu rõ ràng hơn. Không FOMO khi không có setup tốt! ⏳',
      'Vừa chốt lời 15% từ trade XRP. Kỷ luật là chìa khóa thành công trong trading! 💰',
    ],
    crystal: [
      'Thạch anh hồng - viên đá của tình yêu. Ai đang muốn thu hút tình duyên thì nên sở hữu một viên! 💗',
      'Mới nhập về lô Citrine tự nhiên đẹp lắm. Đá này giúp thu hút tài lộc và may mắn! 🌟',
      'Amethyst - viên đá giúp tĩnh tâm và thiền định. Rất thích hợp đặt trên bàn làm việc 💜',
      'Black Tourmaline giúp chặn năng lượng tiêu cực. Ai hay mệt mỏi nên thử đeo nhé! 🖤',
      'Vừa săn được viên Labradorite siêu đẹp! Ánh sáng phản chiếu lung linh cực kỳ! ✨',
    ],
    loa: [
      'Điều bạn nghĩ, bạn sẽ trở thành. Hãy luôn giữ tư duy tích cực mỗi ngày! ✨🧲',
      'Luật hấp dẫn hoạt động 24/7. Hãy cẩn thận với những gì bạn nghĩ và nói! 🌟',
      'Mình đã thực hành visualize mỗi sáng và cuộc sống thay đổi rất nhiều! 🙏',
      'Biết ơn là chìa khóa để mở cánh cửa thịnh vượng. Gratitude journal mỗi tối nhé! 📝',
      'Universe luôn lắng nghe. Hãy request những điều tốt đẹp cho bản thân! 💫',
    ],
    education: [
      'Học không bao giờ đủ. Hôm nay mình đọc xong cuốn "Atomic Habits" - highly recommend! 📚',
      'Chia sẻ kiến thức là cách tốt nhất để học. Ai cần mentor về trading cứ inbox nhé! 🎓',
      'Mindset quan trọng hơn skill. Thay đổi tư duy trước, kỹ năng sẽ theo sau! 💡',
      'Vừa hoàn thành khóa học về phân tích kỹ thuật. Học xong thấy nhìn chart khác hẳn! 📈',
      'Đầu tư cho bản thân là khoản đầu tư có lợi nhuận cao nhất! 🚀',
    ],
    wealth: [
      'Passive income là mục tiêu của mình trong năm nay. Đang xây dựng nhiều nguồn thu! 💰',
      'Tự do tài chính không phải đích đến, mà là hành trình. Enjoy the process! 🎯',
      'Đa dạng hóa danh mục đầu tư là key. Không bỏ tất cả trứng vào một giỏ! 📊',
      'Compound interest - phép màu số 8 của thế giới. Start early, invest consistently! 📈',
      'Tiết kiệm 20% thu nhập, đầu tư 10%. Đây là công thức của mình! 💵',
    ],
    affiliate: [
      'Affiliate marketing là cách tuyệt vời để tạo thu nhập thụ động. Ai muốn học inbox nhé! 🤝',
      'Mới nhận được commission tháng này. Passive income is real! 💸',
      'Chia sẻ sản phẩm tốt = kiếm tiền. Win-win cho cả mình và người dùng! 🎯',
      'Network marketing không phải MLM. Hiểu đúng để làm đúng! 💼',
      'Xây dựng team affiliate đang phát triển tốt. Teamwork makes the dream work! 🚀',
    ],
  };

  const topicContents = contents[topic] || contents.trading;
  return topicContents[Math.floor(Math.random() * topicContents.length)];
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('REGENERATE SEED DATA');
  console.log('='.repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);

  try {
    // Step 1: Delete all existing seed content
    const deleteResult = await deleteAllSeedContent();

    // Step 2: Generate new seed users
    const usersCreated = await generateSeedUsers();

    // Step 3: Generate new seed posts
    const postsCreated = await generateSeedPosts();

    console.log('\n='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log('DELETED:');
    console.log(`  - ${deleteResult.deletedUsers} users`);
    console.log(`  - ${deleteResult.deletedPosts} posts`);
    console.log(`  - ${deleteResult.deletedComments} comments`);
    console.log(`  - ${deleteResult.deletedLikes} likes`);
    console.log('\nCREATED:');
    console.log(`  - ${usersCreated} users (${CONFIG.premiumUsers} premium + ${CONFIG.regularUsers} regular)`);
    console.log(`  - ${postsCreated} posts`);
    console.log('\n='.repeat(60));
    console.log('DONE!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

// Run
main();
