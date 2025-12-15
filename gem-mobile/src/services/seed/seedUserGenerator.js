/**
 * Gemral - Seed User Generator
 * Generates realistic seed users with Vietnamese names and personas
 */

import { supabase } from '../supabase';
import {
  generateVietnameseName,
  generateBio,
  getPersonaByDistribution,
  getRandomItem,
  getRandomNumber,
  VIETNAMESE_LOCATIONS,
  PERSONAS,
} from './seedDatasets';
import { logGeneration } from './seedContentService';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// Tiers for users
const USER_TIERS = ['free', 'basic', 'premium', 'vip'];
const TIER_DISTRIBUTION = {
  free: 0.40,
  basic: 0.30,
  premium: 0.20,
  vip: 0.10,
};

// Batch size for database inserts
const BATCH_SIZE = 50;

/**
 * Get random tier based on distribution
 * @returns {string}
 */
const getRandomTier = () => {
  const rand = Math.random();
  let cumulative = 0;

  for (const [tier, weight] of Object.entries(TIER_DISTRIBUTION)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return tier;
    }
  }

  return 'free';
};

/**
 * Generate a random date within a range
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Date}
 */
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Vietnamese/Asian FEMALE avatar URLs - curated for authenticity
 * Selfie-style, social media aesthetic, natural expressions
 * All photos feature young Vietnamese/Asian women
 */
const VIETNAMESE_FEMALE_AVATARS = [
  'https://i.pinimg.com/736x/3f/d2/d0/3fd2d08ba9be8bb0ce34d5a7df6da92c.jpg',
  'https://i.pinimg.com/736x/14/df/5d/14df5dd6d657db172e4cde19d972c427.jpg',
  'https://i.pinimg.com/736x/fa/e1/6b/fae16bfdbd07dc642abb2519635a10e4.jpg',
  'https://i.pinimg.com/736x/3b/3a/b4/3b3ab4c5bace9842310d27bfca7601d6.jpg',
  'https://i.pinimg.com/736x/c8/ad/79/c8ad7926a64fc5a46c084bdd34ab3bbc.jpg',
  'https://i.pinimg.com/736x/f8/58/79/f8587966b07ccc15c8df1341a92a1c3e.jpg',
  'https://i.pinimg.com/736x/c4/e1/74/c4e1743bee6629c122a2bfb4ef384df3.jpg',
  'https://i.pinimg.com/736x/5b/f1/58/5bf15838cb80ac0ac2264abc3b68a0f0.jpg',
  'https://i.pinimg.com/736x/b9/7c/7a/b97c7ad1fdbe003c90aa2c19045afae0.jpg',
  'https://i.pinimg.com/736x/a0/c4/4f/a0c44f1fb732cdf00679952704debbc0.jpg',
  'https://i.pinimg.com/736x/b8/65/43/b86543af0f434f1d26cab040c2f081a4.jpg',
  'https://i.pinimg.com/736x/75/93/5e/75935e1504bcc08540d177c85a93a66c.jpg',
  'https://i.pinimg.com/736x/79/2a/d5/792ad554cb2728b7ea310e43355bba99.jpg',
  'https://i.pinimg.com/736x/ba/9e/bc/ba9ebc7df401c084192c97564d389289.jpg',
  'https://i.pinimg.com/736x/d6/b9/2b/d6b92b2a9c60f63ee4118ee72cb1540d.jpg',
  'https://i.pinimg.com/736x/51/17/55/5117551480cd9fc4c081955a226dd0bb.jpg',
  'https://i.pinimg.com/736x/27/bd/ec/27bdec21db47b578d2d5cf5449629a96.jpg',
  'https://i.pinimg.com/736x/1a/fa/68/1afa68000121304dea7a1c073c3a7b15.jpg',
  'https://i.pinimg.com/736x/c6/07/de/c607de9d44e1baedcb7bfc23c4c7c6e9.jpg',
  'https://i.pinimg.com/736x/32/2f/82/322f82e0297d9670eea3bdf1f10dd229.jpg',
  'https://i.pinimg.com/736x/d1/29/51/d129514ca9f5f5355d7394ad86ef9898.jpg',
  'https://i.pinimg.com/736x/0d/28/d7/0d28d746a1eeabce8cde00eb3fef0fc9.jpg',
  'https://i.pinimg.com/736x/a0/3f/8b/a03f8b21af8bdc868d8575cf0de6579c.jpg',
  'https://i.pinimg.com/736x/45/3b/94/453b9407bcbf03bcf68e82f28c0c31c9.jpg',
  'https://i.pinimg.com/736x/61/d0/72/61d07239e87fe088bfd2ee23aad51164.jpg',
  'https://i.pinimg.com/736x/be/d0/23/bed0233367ed32d40773c4ffaa66d662.jpg',
  'https://i.pinimg.com/736x/c6/bd/63/c6bd63efbb7d7ae44b9645ce96b80747.jpg',
  'https://i.pinimg.com/736x/58/75/40/58754069788d769e1ba8f5cac1ff7449.jpg',
  'https://i.pinimg.com/736x/b1/40/e9/b140e970e0ae4ec26f48ca79068946b6.jpg',
  'https://i.pinimg.com/736x/57/2c/0b/572c0b178568b7fd1e0db4e239115dbe.jpg',
  'https://i.pinimg.com/736x/7b/40/69/7b4069407fca5d30281504b8d0fd2258.jpg',
  'https://i.pinimg.com/736x/7f/dc/db/7fdcdb97f26c12a25a3030a01190f9bb.jpg',
  'https://i.pinimg.com/736x/ce/cb/d4/cecbd416669379a4dc8b04cb8b218da9.jpg',
  'https://i.pinimg.com/736x/01/a4/63/01a4639dd6ede0fedfd5259fa6386f36.jpg',
  'https://i.pinimg.com/736x/4e/e1/09/4ee109b25502f3379375abcf50049b67.jpg',
  'https://i.pinimg.com/736x/69/58/bf/6958bf03dcb02e015e33859b5ab354d5.jpg',
  'https://i.pinimg.com/736x/8f/8f/11/8f8f11966a32173b56956a057954fcf7.jpg',
  'https://i.pinimg.com/736x/3b/54/c2/3b54c266b8fea0ff251388e0b4e5f224.jpg',
  'https://i.pinimg.com/736x/f6/e7/98/f6e7980808c5785932a5b208873b48b0.jpg',
  'https://i.pinimg.com/736x/c1/3a/88/c13a88b178fdde64c3047810374bbe5d.jpg',
  'https://i.pinimg.com/736x/72/cf/35/72cf35da8e7670f48295aa3fbaa195e4.jpg',
  'https://i.pinimg.com/736x/ad/d3/65/add3659a06284df61bea645b728ec5db.jpg',
  'https://i.pinimg.com/736x/53/5d/fa/535dfa2aee3ea784faf02146309f735f.jpg',
  'https://i.pinimg.com/736x/06/28/c7/0628c75650bce468ca2e4d028857b67a.jpg',
  'https://i.pinimg.com/736x/a3/96/75/a39675d2fbc98940a1afe2c1dd83842f.jpg',
  'https://i.pinimg.com/736x/7b/99/d9/7b99d9121f90c9e7aa35619a25d30c44.jpg',
  'https://i.pinimg.com/736x/86/b1/89/86b18988f53d0b94126c3d44cc6a6a69.jpg',
  'https://i.pinimg.com/736x/f4/09/14/f40914542183bbc69e9e2300c2be283d.jpg',
  'https://i.pinimg.com/736x/11/86/95/11869573b1c9a5eadf6c027260ae02f4.jpg',
  'https://i.pinimg.com/736x/68/53/9a/68539aa40de98f4f738f8cf626bdd0fe.jpg',
  'https://i.pinimg.com/736x/77/70/8b/77708b7ef186c3c2ba55ae25af959681.jpg',
  'https://i.pinimg.com/736x/e8/fb/b3/e8fbb3ae8fa5645a8ba70d20c571fddc.jpg',
  'https://i.pinimg.com/736x/7c/97/3c/7c973c6ed7967a1627e823e77210b5fb.jpg',
  'https://i.pinimg.com/736x/54/fd/cd/54fdcdfb1e2b6bdc3e06b77bc19bb9b1.jpg',
  'https://i.pinimg.com/736x/12/49/40/124940776e2f163d55cde101ad88cf1c.jpg',
  'https://i.pinimg.com/736x/9a/58/de/9a58de664249e5b7d01c8aabc14685ef.jpg',
  'https://i.pinimg.com/736x/e4/45/f8/e445f8aefe1cd6519f0043dcfcd496d5.jpg',
  'https://i.pinimg.com/736x/57/fd/e0/57fde0e9c0666d6839b30e3e88e36685.jpg',
  'https://i.pinimg.com/736x/a9/bc/34/a9bc3430e901126ed21337a6633a6aa4.jpg',
  'https://i.pinimg.com/736x/7b/c0/af/7bc0af0540ae4e52ce5b3d160ff5a8d7.jpg',
  'https://i.pinimg.com/736x/32/4c/3a/324c3a6eeb909c49de6815b93122e292.jpg',
  'https://i.pinimg.com/736x/7e/e1/66/7ee166a495cdb5e9aa3f5a82c8c19c2f.jpg',
  'https://i.pinimg.com/736x/e1/78/de/e178de1737eb1f4a9e4f8e8d2099d9ab.jpg',
  'https://i.pinimg.com/736x/03/15/06/031506222b33758cf19e2945165bcb6c.jpg',
  'https://i.pinimg.com/736x/60/50/3a/60503a134bbae22f51c98662b54aa200.jpg',
  'https://i.pinimg.com/736x/ce/c4/3d/cec43d19821d068c70b1880f27326353.jpg',
  'https://i.pinimg.com/736x/7d/18/3a/7d183ad0b186dd27622fa9fb5c79a2f2.jpg',
  'https://i.pinimg.com/736x/f1/84/e8/f184e83c780f38230948267bb2e7c9a7.jpg',
  'https://i.pinimg.com/736x/42/c7/67/42c767eb344b63f1b21fb8b4c3e8bfed.jpg',
  'https://i.pinimg.com/736x/af/36/bf/af36bfb3f2f618c46783864e36b5fe86.jpg',
  'https://i.pinimg.com/736x/ea/76/6a/ea766a30ae65f3b10b52d71deb971bd9.jpg',
  'https://i.pinimg.com/736x/b5/fa/a5/b5faa53ea4bd4718e6d4e43e5a506960.jpg',
  'https://i.pinimg.com/736x/1c/89/71/1c8971964c90ca9a177695d939d11030.jpg',
  'https://i.pinimg.com/736x/9f/57/c1/9f57c1595bdc5913f41e74876e04d08f.jpg',
  'https://i.pinimg.com/736x/59/9f/93/599f93193974b0537e3be53169657b08.jpg',
  'https://i.pinimg.com/736x/b6/24/a5/b624a53fa3bc8302e8cd103fca97195e.jpg',
  'https://i.pinimg.com/736x/9f/0a/c4/9f0ac4d1141e4825840ca3b5cf3ad43d.jpg',
  'https://i.pinimg.com/736x/c0/82/72/c08272f94e62ba91b1d90e0e0a6a84a5.jpg',
  'https://i.pinimg.com/736x/11/5f/71/115f713227e0c9b783cbfe065f0fed60.jpg',
  'https://i.pinimg.com/736x/89/a6/d5/89a6d5872cccf25f0eb3eb72f2bcee61.jpg',
  'https://i.pinimg.com/736x/8f/67/03/8f6703e52814fd8e72052d4824bcefa6.jpg',
  'https://i.pinimg.com/736x/7e/f4/00/7ef4007b1040b35d7730138e87ecba55.jpg',
  'https://i.pinimg.com/736x/d0/08/64/d00864fc0079eba838a9faba62d4eefd.jpg',
  'https://i.pinimg.com/736x/a8/39/1e/a8391e11a50649d33f973a6b29b0cc81.jpg',
  'https://i.pinimg.com/736x/a1/85/8e/a1858ea78c6a308eaa9bb7d6eea39650.jpg',
  'https://i.pinimg.com/736x/06/b8/5a/06b85a0009bce309fad40f3e5dea68aa.jpg',
  'https://i.pinimg.com/736x/1b/08/d1/1b08d16272488caa1986e435b5bc9853.jpg',
  'https://i.pinimg.com/736x/e4/7a/ed/e47aedbdddac8aca3b78807ffddd1296.jpg',
  'https://i.pinimg.com/736x/c1/3a/5e/c13a5e9a6a0bbc41d42b86a804efec6d.jpg',
  'https://i.pinimg.com/736x/db/7e/83/db7e83a68a793ef4e5eaa67164ba66c3.jpg',
  'https://i.pinimg.com/736x/20/3a/61/203a61ac20ae2b889abf655e2494ce60.jpg',
  'https://i.pinimg.com/736x/c3/cf/bb/c3cfbb20cc99209992c80c786da7470d.jpg',
  'https://i.pinimg.com/736x/e1/f6/69/e1f669e67a84937a3c2be499b8ce3b34.jpg',
  'https://i.pinimg.com/736x/4b/78/17/4b78175e66862fec5f8a19877e4699fd.jpg',
  'https://i.pinimg.com/736x/30/dd/67/30dd676b46a78b01268561aa4a000fab.jpg',
  'https://i.pinimg.com/736x/ca/40/f0/ca40f0ec106477ce8f41cbdb8dd475b6.jpg',
  'https://i.pinimg.com/736x/11/b6/b2/11b6b2122b4045541a9b5f8938bbda10.jpg',
  'https://i.pinimg.com/736x/b2/a2/95/b2a295905847e277889173a5fc4f1067.jpg',
  'https://i.pinimg.com/736x/9c/43/d0/9c43d0c1da78b2203f4824f228562016.jpg',
  'https://i.pinimg.com/736x/4d/b7/84/4db78403662de44abe6ef7efe6114db4.jpg',
  'https://i.pinimg.com/736x/56/9c/c5/569cc5e172653a4681d7814301fd40ed.jpg',
  'https://i.pinimg.com/736x/ac/cc/79/accc79585a759565f2133791f6661ec4.jpg',
  'https://i.pinimg.com/736x/7c/39/2a/7c392a98bfd433c94321dc113cc6279c.jpg',
  'https://i.pinimg.com/736x/19/3d/8b/193d8bf7255ce5e93922dcfcb659cc87.jpg',
  'https://i.pinimg.com/736x/03/ad/ac/03adac49a605f37a706d25697ba46dd4.jpg',
  'https://i.pinimg.com/736x/d6/7d/77/d67d77a805655000a5bf9dc22b4cc3c5.jpg',
  'https://i.pinimg.com/736x/50/90/10/5090102c6c4f07504e6a998676dbf013.jpg',
  'https://i.pinimg.com/736x/bd/bd/4b/bdbd4b05cd443523e73703a16c6f9c7a.jpg',
  'https://i.pinimg.com/736x/a4/1b/d6/a41bd69867d35432eb20f212d35391ba.jpg',
  'https://i.pinimg.com/736x/93/9e/de/939eded905ae57c26dd5d2595ff4b4aa.jpg',
  'https://i.pinimg.com/736x/f9/fa/83/f9fa8323e403470a149e7ddfcae1ee4b.jpg',
  'https://i.pinimg.com/736x/2c/42/a6/2c42a6c246e2143ce44460077468944c.jpg',
  'https://i.pinimg.com/736x/f5/d9/f1/f5d9f1337cccdc6833d4edfd65b48d56.jpg',
  'https://i.pinimg.com/736x/64/d2/78/64d27866e2ae5383fe0e2b0d5d0120f5.jpg',
  'https://i.pinimg.com/736x/a3/c3/71/a3c37176720f4921d8f55c24112e64f5.jpg',
  'https://i.pinimg.com/736x/94/76/5f/94765f8881d1a3df040d834e45088727.jpg',
  'https://i.pinimg.com/736x/5d/1a/57/5d1a575a7e3e86312f6dc1187b0574cb.jpg',
  'https://i.pinimg.com/736x/2b/81/cb/2b81cb727f7cf32fba4ef41d11c1c94e.jpg',
  'https://i.pinimg.com/736x/2f/53/28/2f532891b2aae9e01b04a89fefed36bf.jpg',
  'https://i.pinimg.com/736x/97/e9/03/97e9034ee0b87a97375d6ab33994ea12.jpg',
  'https://i.pinimg.com/736x/74/1b/60/741b601bcf03f80755129368bcce2064.jpg',
  'https://i.pinimg.com/736x/11/95/77/11957784af021d45511b4c3a5840e95d.jpg',
  'https://i.pinimg.com/736x/bb/48/f6/bb48f63bc9a65825b7d018c7ab72c542.jpg',
  'https://i.pinimg.com/736x/3e/e7/3c/3ee73c3de62fb80c238835c65d42fcfc.jpg',
  'https://i.pinimg.com/736x/0f/79/7d/0f797d67831c91cac319591976523218.jpg',
  'https://i.pinimg.com/736x/84/19/43/8419431fb860cb9843d6698197271a6d.jpg',
  'https://i.pinimg.com/736x/af/c2/5b/afc25bfa093895ca09c47c858607a986.jpg',
  'https://i.pinimg.com/736x/86/15/e7/8615e7a77d2b1854edf3380966581457.jpg',
  'https://i.pinimg.com/736x/f8/46/a7/f846a73751f1eb4abdf4ea73f7f441c8.jpg',
  'https://i.pinimg.com/736x/e8/23/8c/e8238ceb2cc74166c842db9aacfc2806.jpg',
  'https://i.pinimg.com/736x/7d/53/90/7d53907ebf15b64d93a103aef4739b50.jpg',
  'https://i.pinimg.com/736x/7c/43/c3/7c43c3a28fed00f33925bac032853652.jpg',
  'https://i.pinimg.com/736x/9b/12/d3/9b12d393236864f317b1101b9da76d64.jpg',
  'https://i.pinimg.com/736x/1e/1d/f8/1e1df8e720067559eb87fc1dfb858cc8.jpg',
  'https://i.pinimg.com/736x/63/31/7f/63317f178ea921e5515319779827441d.jpg',
  'https://i.pinimg.com/736x/8d/2a/fc/8d2afcada2913e30e026913b47c4af99.jpg',
  'https://i.pinimg.com/736x/c0/5a/02/c05a02c417407856d931b6c5bfa984d8.jpg',
  'https://i.pinimg.com/736x/9f/2a/99/9f2a9963dcbb9e9d45927f539a53b4fa.jpg',
  'https://i.pinimg.com/736x/f8/c7/f1/f8c7f13067711b1671a0e21aca9b2598.jpg',
  'https://i.pinimg.com/736x/f1/8d/14/f18d148c1ce0772fdc18de0daf61650c.jpg',
  'https://i.pinimg.com/736x/f3/7f/f8/f37ff8f3425e4515563045c90095948f.jpg',
  'https://i.pinimg.com/736x/bd/c7/5b/bdc75b04d5db12ac0c1dfa97d6e4b910.jpg',
  'https://i.pinimg.com/736x/3c/56/84/3c56847f43b936a584b8525333c26c9a.jpg',
  'https://i.pinimg.com/736x/cb/49/07/cb4907440f54fb0a64ff8680b80e9ef8.jpg',
  'https://i.pinimg.com/736x/3b/5d/a9/3b5da92c4fc7c52ff405353bd095bdbe.jpg',
  'https://i.pinimg.com/736x/36/93/d2/3693d245feed2e11bdb8cd1aad5515b5.jpg',
  'https://i.pinimg.com/736x/8a/4b/a5/8a4ba598d9460b9decc1db87a706ba5c.jpg',
  'https://i.pinimg.com/736x/36/1c/ee/361ceec75951611990b742b61cf9dd12.jpg',
  'https://i.pinimg.com/736x/0a/13/57/0a1357918d94aa5ad780f8c3300ebb12.jpg',
  'https://i.pinimg.com/736x/54/e7/03/54e703f7717264ebf1b4cd78906f353b.jpg',
  'https://i.pinimg.com/736x/bb/10/5e/bb105ee4221657a7f657d0d0f7517921.jpg',
  'https://i.pinimg.com/736x/b5/be/95/b5be9504ea388c1346c8f90b711cfbe3.jpg',
  'https://i.pinimg.com/736x/32/a4/03/32a403dfe7ae68c5c42227cc8a377597.jpg',
  'https://i.pinimg.com/736x/0b/ad/2a/0bad2a5d95214b0e1c6d51bd3b6b72ec.jpg',
  'https://i.pinimg.com/736x/99/30/84/993084d01c50b7ee524145d929d2604a.jpg',
  'https://i.pinimg.com/736x/a7/44/bf/a744bf429f1ad65c437396438864c2b1.jpg',
  'https://i.pinimg.com/736x/ee/2d/1b/ee2d1b8281a223c2e90f20b86c682a5b.jpg',
  'https://i.pinimg.com/736x/6f/f5/4e/6ff54e094792e537e489f811c8e88752.jpg',
  'https://i.pinimg.com/736x/07/56/f3/0756f3c101bc2296cdbaf8607a3f2617.jpg',
  'https://i.pinimg.com/736x/5d/ba/d9/5dbad9b1044203ce25f25cd977e2b585.jpg',
  'https://i.pinimg.com/736x/a6/48/40/a64840bd5dd8a8bcea901b51aa849460.jpg',
  'https://i.pinimg.com/736x/81/70/7d/81707dde44c94937d79fe5d6452bce57.jpg',
  'https://i.pinimg.com/736x/48/bc/08/48bc084bbe34685a94f476330b6ae89b.jpg',
  'https://i.pinimg.com/736x/46/3b/f7/463bf7c4434ffc8f725e36e8395cc085.jpg',
  'https://i.pinimg.com/736x/80/2b/d9/802bd93762ae3fe79b1f5603193147b5.jpg',
  'https://i.pinimg.com/736x/2d/e5/76/2de57663959135195bac8e82148e17d8.jpg',
  'https://i.pinimg.com/736x/90/c4/2e/90c42e6affcfe085051c00d786c7ebf4.jpg',
  'https://i.pinimg.com/736x/d1/24/da/d124da2c4ebe3e88d7d801351a03067e.jpg',
  'https://i.pinimg.com/736x/eb/e2/8b/ebe28b5980c84aacea473a83ea3d88db.jpg',
  'https://i.pinimg.com/736x/c7/6a/8f/c76a8f2d5e897660c3b60eadf3ec7702.jpg',
  'https://i.pinimg.com/736x/b2/2e/3f/b22e3f56b30f1605aacf363b37f0b8bb.jpg',
  'https://i.pinimg.com/736x/16/9c/ff/169cff7999147792c5c25e2c8a7b484c.jpg',
  'https://i.pinimg.com/736x/19/aa/97/19aa9758cbd1bae0bea5b738e8c7d563.jpg',
  'https://i.pinimg.com/736x/a9/95/bb/a995bb78a7acf5d12e68066e7ec96dee.jpg',
  'https://i.pinimg.com/736x/e5/14/17/e51417fbb3e1d84598637db2c1ac2c0c.jpg',
  'https://i.pinimg.com/736x/0c/4e/08/0c4e081134c8d331689fa96af9e4699c.jpg',
  'https://i.pinimg.com/736x/44/4f/85/444f85594ceed021b7dc93443b73dc9b.jpg',
  'https://i.pinimg.com/736x/cd/74/7c/cd747cbe8136fc7d822cd5ab9f6bf270.jpg',
  'https://i.pinimg.com/736x/06/ca/e3/06cae3db41da380542f83d43e7f0eed9.jpg',
  'https://i.pinimg.com/736x/b2/8d/99/b28d995d1ca5a77932896ee13dae8dfd.jpg',
  'https://i.pinimg.com/736x/89/5b/c7/895bc72a9306877aa7838cb6e6db575e.jpg',
  'https://i.pinimg.com/736x/1f/78/00/1f7800082ef4f92ec6c96d6bdac8facf.jpg',
  'https://i.pinimg.com/736x/6e/20/86/6e2086dd9fb7226efaba5869a919dfb4.jpg',
  'https://i.pinimg.com/736x/43/81/a6/4381a64a041c46239d6d0946b5f566a4.jpg',
  'https://i.pinimg.com/736x/15/db/ac/15dbac81ecf685bdf61b7c5da80651fa.jpg',
  'https://i.pinimg.com/736x/94/0b/c2/940bc2e155c5c76e5966046ca694d5df.jpg',
  'https://i.pinimg.com/736x/e8/8a/fe/e88afee58da097f6b785ee5105cb6433.jpg',
  'https://i.pinimg.com/736x/74/04/b3/7404b3a27690bc07ba99bd1984b7cb51.jpg',
  'https://i.pinimg.com/736x/f1/9b/76/f19b76094b4b62002afd5d38ba17e7aa.jpg',
  'https://i.pinimg.com/736x/77/da/0c/77da0c0b166a47cb7a9b692b160f9ff2.jpg',
  'https://i.pinimg.com/736x/0f/ca/d8/0fcad82e5b588a629131c0e9d511962e.jpg',
  'https://i.pinimg.com/736x/44/c0/a7/44c0a75993541fb231add3c2fb54ec30.jpg',
  'https://i.pinimg.com/736x/b1/82/3d/b1823ddcce54e18a28e67940f264454c.jpg',
  'https://i.pinimg.com/736x/56/cd/c6/56cdc6cd8b04d8baa6bd5344134c9df7.jpg',
  'https://i.pinimg.com/736x/ac/9f/9a/ac9f9a0be075a64064b4f87733f39aa7.jpg',
  'https://i.pinimg.com/736x/01/53/b4/0153b4c432aa9f9a522294fd471a0a1f.jpg',
  'https://i.pinimg.com/736x/f7/e9/ca/f7e9cab2ee41dd9b5c846f0cff2b01e0.jpg',
  'https://i.pinimg.com/736x/66/8a/bd/668abd652aca77b590d9edc54242a4a9.jpg',
  'https://i.pinimg.com/736x/48/f1/77/48f17761b4b905a0ad3e9ce65d396d52.jpg',
  'https://i.pinimg.com/736x/dc/22/f4/dc22f4f9de18ec97d5c44c8abe88b7cf.jpg',
  'https://i.pinimg.com/736x/e2/3d/06/e23d0697e264eeb3beed8b7afbb670f9.jpg',
  'https://i.pinimg.com/736x/bf/2d/be/bf2dbef379cf5febcee9c05a42c193b7.jpg',
  'https://i.pinimg.com/736x/bf/a9/bb/bfa9bb51af278e120c3b424e8784915e.jpg',
  'https://i.pinimg.com/736x/bd/9d/97/bd9d977f8cb8f0b332351613435ff35c.jpg',
  'https://i.pinimg.com/736x/23/3d/48/233d4820f3264fbb47427971e45465fd.jpg',
  'https://i.pinimg.com/736x/4d/74/14/4d74143cea13c7be6e2d7c6d392355e1.jpg',
  'https://i.pinimg.com/736x/93/a4/c5/93a4c51c672a8501abbeafcf6740f703.jpg',
  'https://i.pinimg.com/736x/0a/07/8b/0a078b2ba38ff34db15981af041ef09b.jpg',
  'https://i.pinimg.com/736x/d3/6b/b4/d36bb47e771f629d19b0918e3027913a.jpg',
  'https://i.pinimg.com/736x/0e/8d/0c/0e8d0cff4631678f7124e31f05e4b016.jpg',
  'https://i.pinimg.com/736x/d2/c1/c3/d2c1c3da63fbb0676cb0160b86237a91.jpg',
  'https://i.pinimg.com/736x/e6/ce/e4/e6cee4e7045f283fbec6ca9e253599d5.jpg',
  'https://i.pinimg.com/736x/79/fc/02/79fc029c878f3cc2d79f410b4689921d.jpg',
  'https://i.pinimg.com/736x/e2/be/49/e2be49084012280a302d7c70040211ef.jpg',
  'https://i.pinimg.com/736x/94/f7/f8/94f7f83d28b935f57c3e0bc42ca1a8aa.jpg',
  'https://i.pinimg.com/736x/de/15/74/de1574c224ac5611a8af011293814c23.jpg',
  'https://i.pinimg.com/736x/02/6e/0f/026e0f49058a98193605d68d800fc4f3.jpg',
  'https://i.pinimg.com/736x/c2/a1/53/c2a153f79773b51df6065a4613eeb5f9.jpg',
  'https://i.pinimg.com/736x/a1/62/5e/a1625eca30f0a141f08017794371d6e4.jpg',
  'https://i.pinimg.com/736x/a5/8e/a8/a58ea88ef014ea03d20ed19d80430948.jpg',
  'https://i.pinimg.com/736x/2b/e6/be/2be6beccbf5f3f8acadb017db230ed98.jpg',
  'https://i.pinimg.com/736x/53/c3/1d/53c31d91ec79835f2de2abc2afb16e4d.jpg',
  'https://i.pinimg.com/736x/bf/0d/30/bf0d303d82cfc36be970aabd1a851d18.jpg',
  'https://i.pinimg.com/736x/e2/4c/51/e24c5162026c5a9e97ca603e9ded1b45.jpg',
  'https://i.pinimg.com/736x/86/0e/ca/860eca2632d11bf0d12d13e5bab051c8.jpg',
  'https://i.pinimg.com/736x/1e/70/66/1e7066d8833e349a486587fee9f11e7b.jpg',
  'https://i.pinimg.com/736x/f4/08/d8/f408d8135c07bd5515f27820ed5c4f6d.jpg',
  'https://i.pinimg.com/736x/25/dc/c2/25dcc28f8de5e00c1abb6380aa196109.jpg',
  'https://i.pinimg.com/736x/3f/2e/a6/3f2ea6cdbf8fb3e82b1bb7e312382830.jpg',
  'https://i.pinimg.com/736x/2e/9c/66/2e9c662535b5a5669f0dfe7dcc11edb7.jpg',
  'https://i.pinimg.com/736x/d6/00/25/d60025dd49efdbffda8bafcee7e29c12.jpg',
  'https://i.pinimg.com/736x/e9/4e/12/e94e126d8bf4ecbfb48e6fc1524ba9be.jpg',
  'https://i.pinimg.com/736x/de/56/34/de5634d408e0a6de346a5295f4b72a5b.jpg',
  'https://i.pinimg.com/736x/2f/8a/0d/2f8a0d1c6a9d82a2e0be4d545398706a.jpg',
  'https://i.pinimg.com/736x/89/35/0b/89350b220215ef509ad729c4b5b7fbf2.jpg',
  'https://i.pinimg.com/736x/3d/ee/a9/3deea93527cf2d9f09dfb4d994242b06.jpg',
  'https://i.pinimg.com/736x/14/87/4a/14874a80fa55784c640a2b6fad286e32.jpg',
  'https://i.pinimg.com/736x/57/90/5a/57905a98dfa34ed018bfe61b68709e14.jpg',
  'https://i.pinimg.com/736x/ca/29/59/ca2959096caac68c4b503e9e81a0ec53.jpg',
  'https://i.pinimg.com/736x/f9/fb/ad/f9fbad49baec97526b527d5ae4d72b2f.jpg',
  'https://i.pinimg.com/736x/04/0b/46/040b46e51b2228a35cceaed656b4a66c.jpg',
  'https://i.pinimg.com/736x/9f/9c/52/9f9c52a6e41ba8792c8dac3c3ced9eef.jpg',
  'https://i.pinimg.com/736x/72/28/bc/7228bc0b4751a002878be9045a45d4f7.jpg',
  'https://i.pinimg.com/736x/c8/55/3c/c8553cea3973e48f7bdcaef625b08228.jpg',
  'https://i.pinimg.com/736x/d1/1b/03/d11b03d2bfc66a2154e20bc7db8c0a90.jpg',
  'https://i.pinimg.com/736x/53/bb/71/53bb711db172fb9795f5c53ab6e2807c.jpg',
  'https://i.pinimg.com/736x/e8/01/7d/e8017d79718cca06c0da62036f08a023.jpg',
  'https://i.pinimg.com/736x/c2/aa/c6/c2aac67b49c800d3f3786fafd4b060b2.jpg',
  'https://i.pinimg.com/736x/ce/57/73/ce5773a758d46729dc370b317a2214f2.jpg',
  'https://i.pinimg.com/736x/7d/80/76/7d8076966e3f436af91ac2407637546d.jpg',
  'https://i.pinimg.com/736x/e6/3f/c4/e63fc417e8a1453cac2c64e1d51fb246.jpg',
  'https://i.pinimg.com/736x/58/16/f0/5816f012e5a218055b3f16a95e23820c.jpg',
  'https://i.pinimg.com/736x/0f/00/75/0f0075c0dd03755a15ace7bab3f1f382.jpg',
  'https://i.pinimg.com/736x/87/53/ee/8753ee4329c8b67beb4d268f9efbea28.jpg',
  'https://i.pinimg.com/736x/1f/b7/c5/1fb7c526737782bc052cd630c8c028b7.jpg',
  'https://i.pinimg.com/736x/23/ac/56/23ac56a44138fede57f73e44854162f0.jpg',
  'https://i.pinimg.com/736x/36/f2/81/36f2817eb0c696364a9ffac5e656b7d8.jpg',
  'https://i.pinimg.com/736x/86/0e/13/860e139c54526205be45cd8058ba7603.jpg',
  'https://i.pinimg.com/736x/cb/f6/fd/cbf6fd44470e77d384b18cfac3018479.jpg',
  'https://i.pinimg.com/736x/84/96/ef/8496ef8c72238a7a411a9a2e67b0e341.jpg',
  'https://i.pinimg.com/736x/f2/7e/80/f27e808be456b3d6390b69b5b61d36ce.jpg',
  'https://i.pinimg.com/736x/9f/df/47/9fdf47701ae0ec76529f33928f661b04.jpg',
  'https://i.pinimg.com/736x/77/2c/86/772c862ce357cfc70ad49fade4d92aaa.jpg',
  'https://i.pinimg.com/736x/a1/50/b9/a150b96df648e3050a1bc068e237f005.jpg',
  'https://i.pinimg.com/736x/56/a3/21/56a321b8e05bb0573fe787ed792e85a9.jpg',
  'https://i.pinimg.com/736x/0a/bc/43/0abc43894a7960373129452b759af9c9.jpg',
];

/**
 * Vietnamese/Asian MALE avatar URLs - curated for authenticity
 * Selfie-style, social media aesthetic, natural expressions
 * All photos feature young Vietnamese/Asian men
 */
const VIETNAMESE_MALE_AVATARS = [
  'https://i.pinimg.com/736x/05/1a/f3/051af3f04c9438bad4558b948063374c.jpg',
  'https://i.pinimg.com/736x/81/50/4a/81504a0817de4a906f10f07b1b487469.jpg',
  'https://i.pinimg.com/736x/f1/fb/ec/f1fbec2fb7ef1a19a5a7283bd40fba9e.jpg',
  'https://i.pinimg.com/736x/1a/28/e3/1a28e3bbb917a135106bd1678e198d9e.jpg',
  'https://i.pinimg.com/736x/3b/c7/57/3bc7574bc01662f60682ad012c9ec8dc.jpg',
  'https://i.pinimg.com/736x/27/62/9d/27629d5c8e6a7cd0122c945505245182.jpg',
  'https://i.pinimg.com/736x/92/d9/44/92d94467f10b519172a2b5f9f2786c83.jpg',
  'https://i.pinimg.com/736x/d0/49/38/d04938baa7b24a893459b577c4e22b52.jpg',
  'https://i.pinimg.com/736x/2c/dc/ec/2cdcec506ffc0e3f9c75748e459fa02e.jpg',
  'https://i.pinimg.com/736x/ed/47/e2/ed47e252e4d5f7d663d2e7d2c33ff872.jpg',
  'https://i.pinimg.com/736x/57/f4/b8/57f4b8d7d4815319cae6cd73f5ea0ed0.jpg',
  'https://i.pinimg.com/736x/c4/22/de/c422de60c16a06950f70320075c61cc3.jpg',
  'https://i.pinimg.com/736x/56/b8/7d/56b87d11cfc47dacbf114d0197c8b756.jpg',
  'https://i.pinimg.com/736x/f1/bc/82/f1bc82a756caaeae7f76bc9e4be3f8b8.jpg',
  'https://i.pinimg.com/736x/3b/0c/be/3b0cbeff6b9a04e46e06eb49f84fcf4e.jpg',
  'https://i.pinimg.com/736x/4f/55/74/4f5574c508ea39933a07c56fbfa2c9f4.jpg',
  'https://i.pinimg.com/736x/f4/b2/89/f4b289b33ed4d549b74434990aa0c280.jpg',
  'https://i.pinimg.com/736x/ae/9f/79/ae9f795b9fd055f9682ccc640fcd636b.jpg',
  'https://i.pinimg.com/736x/3d/96/07/3d9607a92c1408e9c7a9ea976db72682.jpg',
  'https://i.pinimg.com/736x/a5/d8/8d/a5d88db1e819700fb10b3c276185680a.jpg',
  'https://i.pinimg.com/736x/d1/e1/a1/d1e1a162a84552e4f1b02d7a8699f860.jpg',
  'https://i.pinimg.com/736x/68/5d/ff/685dffa7fdd1ff3a2569d6a2a45973d7.jpg',
  'https://i.pinimg.com/736x/f6/a3/25/f6a325f2d3a7a8599b59d31633b6bcd4.jpg',
  'https://i.pinimg.com/736x/af/df/7b/afdf7b9064dc1e9332f2bf2c377cb22e.jpg',
  'https://i.pinimg.com/736x/47/43/88/474388756a34fd70f8ebde2aa1429f34.jpg',
  'https://i.pinimg.com/736x/3b/05/3f/3b053f2e440178c1cfc0b61e20c6572b.jpg',
  'https://i.pinimg.com/736x/e3/93/62/e39362ee969476cdd0cfd4a1f11673b5.jpg',
  'https://i.pinimg.com/736x/ad/e5/61/ade5612e772fb7cfddd5e3878402c923.jpg',
  'https://i.pinimg.com/736x/14/dd/d7/14ddd7c3e40eb65b7a4bc2e168bf11fc.jpg',
  'https://i.pinimg.com/736x/76/32/8c/76328c92b9afb7871d7fc0bd906e8135.jpg',
  'https://i.pinimg.com/736x/46/0d/70/460d70ed8b894782b13f7a877c68539a.jpg',
  'https://i.pinimg.com/736x/4e/0a/7c/4e0a7c4d831e1f4f328b4b726bc21f5a.jpg',
  'https://i.pinimg.com/736x/69/04/f1/6904f193e114096033a7c7b386c5b0f1.jpg',
  'https://i.pinimg.com/736x/38/a7/30/38a73084c28f09be5073017725eb854e.jpg',
  'https://i.pinimg.com/736x/6a/e4/ca/6ae4ca3f1aed26f1200234899cc47829.jpg',
  'https://i.pinimg.com/736x/4d/a7/5b/4da75b1c5d00b48a0e41468d25cd40a2.jpg',
  'https://i.pinimg.com/736x/fa/ca/01/faca0185c7095680e34f0751d8220e95.jpg',
  'https://i.pinimg.com/736x/0f/17/c6/0f17c6c8fc0fa83c14cea9acfcbf78f5.jpg',
  'https://i.pinimg.com/736x/94/78/7d/94787d998c67f53162852e1aaac689f0.jpg',
  'https://i.pinimg.com/736x/42/83/ee/4283ee52b7a7c4f93ac0471905311acd.jpg',
  'https://i.pinimg.com/736x/0a/1a/da/0a1adadfccab947b2290e145a049f747.jpg',
  'https://i.pinimg.com/736x/55/5c/6b/555c6b9ee33937ae43af53a44c3ab94e.jpg',
  'https://i.pinimg.com/736x/e8/9f/b6/e89fb66c8fa7b7280dc0f1829ad06b3f.jpg',
  'https://i.pinimg.com/736x/1e/da/61/1eda6174d9a0effd4503cea494356993.jpg',
  'https://i.pinimg.com/736x/54/63/b8/5463b868b747e7a68df098a6c52a4212.jpg',
  'https://i.pinimg.com/736x/d6/48/c8/d648c89d50cb1607abbffd307f83fa00.jpg',
  'https://i.pinimg.com/736x/34/e9/31/34e931fd57ad9d6eb5bfb42d3ff31c3b.jpg',
  'https://i.pinimg.com/736x/3e/c5/82/3ec582e5379aca7621852aecb02b6904.jpg',
  'https://i.pinimg.com/736x/c8/e6/8f/c8e68f23b22ed8b02f9219bdf8c49948.jpg',
  'https://i.pinimg.com/736x/21/ed/b0/21edb0488c61dceb325317c5188ffd9e.jpg',
  'https://i.pinimg.com/736x/0b/ef/79/0bef792cd01bd80bedd0b89cb1a4c9b4.jpg',
  'https://i.pinimg.com/736x/4a/98/6c/4a986c06dcd1eaea4d1cdb60ce80a95a.jpg',
  'https://i.pinimg.com/736x/6f/f5/10/6ff5106660a42be176adb33ac5d019ad.jpg',
  'https://i.pinimg.com/736x/20/b1/9d/20b19df6e66c92be70df7b170d59b804.jpg',
  'https://i.pinimg.com/736x/70/42/31/704231e2958eb7a69cd17dd8dfee13ee.jpg',
  'https://i.pinimg.com/736x/6f/c0/56/6fc05658b5a0d2bcca7a042e628cc9ce.jpg',
  'https://i.pinimg.com/736x/45/ac/c7/45acc728dbd1f26b950b1ce2d59a1f41.jpg',
  'https://i.pinimg.com/736x/fb/cb/67/fbcb67b8462dc34f793efea9e69d16cc.jpg',
  'https://i.pinimg.com/736x/69/e3/68/69e368346c424d9e5c12e1ff7318bd5c.jpg',
  'https://i.pinimg.com/736x/1d/92/7d/1d927d6b167e1cd49ac42c941cfe652c.jpg',
  'https://i.pinimg.com/736x/e6/bf/92/e6bf9205eb51c166818fb7a8af13f975.jpg',
  'https://i.pinimg.com/736x/fa/46/dd/fa46ddafa1c73217fcba1b2a554509f4.jpg',
  'https://i.pinimg.com/736x/4d/11/2d/4d112d9843ac6cef7e398ccc07e13f2d.jpg',
  'https://i.pinimg.com/736x/5b/37/67/5b37673f547575ce3fad262bfd134ef3.jpg',
  'https://i.pinimg.com/736x/ec/cc/4d/eccc4dd77b1978feb48bf42a052f6023.jpg',
  'https://i.pinimg.com/736x/9b/2d/62/9b2d624442973e6ab422e91858ac2bed.jpg',
  'https://i.pinimg.com/736x/d8/6a/86/d86a8694e0cf94089bfdae7b2982fa2a.jpg',
  'https://i.pinimg.com/736x/db/fd/cb/dbfdcb5cccf103bf8d6737d2fb887730.jpg',
  'https://i.pinimg.com/736x/f1/dc/54/f1dc54c31650ce27a65f7948840ad35d.jpg',
  'https://i.pinimg.com/736x/d8/98/0a/d8980a82263fe5ef7ec2217921742d2e.jpg',
  'https://i.pinimg.com/736x/47/bb/cb/47bbcb7c86a5bab4addd5872b3d775d2.jpg',
  'https://i.pinimg.com/736x/f6/17/c2/f617c28bdfda0a446bb9f668ec9e24d1.jpg',
  'https://i.pinimg.com/736x/3f/9c/26/3f9c2685a5d5c83cf1b05584e5842c9f.jpg',
  'https://i.pinimg.com/736x/38/bd/43/38bd4328f081301a93466ea979e7dec4.jpg',
  'https://i.pinimg.com/736x/62/ff/30/62ff30bfdc9c6c7fe1e6d38420dd15eb.jpg',
  'https://i.pinimg.com/736x/4e/bd/c3/4ebdc394bebe9bafa359ede3ea59ae9b.jpg',
  'https://i.pinimg.com/736x/40/d3/bf/40d3bfabe5df30ef3bc4f4c046fb128e.jpg',
  'https://i.pinimg.com/736x/e3/2b/53/e32b53922d1570a90cc5a9d0ca5f4c32.jpg',
  'https://i.pinimg.com/736x/2e/e0/1f/2ee01fabadab4b5ba778ad50cc6e23ff.jpg',
  'https://i.pinimg.com/736x/8e/b1/fb/8eb1fbf60e0f806c05f54128edd75ff8.jpg',
  'https://i.pinimg.com/736x/5e/df/27/5edf2792f3f68102f18d65cb4f1758c8.jpg',
  'https://i.pinimg.com/736x/64/42/d8/6442d8e9076abb146eae0d075276b08f.jpg',
  'https://i.pinimg.com/736x/b1/fd/50/b1fd50f8471e96c35594604ac3a6cb9a.jpg',
  'https://i.pinimg.com/736x/12/c5/94/12c5946c936bec1181545ad1d356c643.jpg',
  'https://i.pinimg.com/736x/9b/0f/a6/9b0fa6542d104cf0113859d5b74c09d6.jpg',
  'https://i.pinimg.com/736x/51/cc/29/51cc2954162f12887b303490f13a1e7a.jpg',
  'https://i.pinimg.com/736x/9d/7d/1d/9d7d1da248621196b61431fc9f16db10.jpg',
  'https://i.pinimg.com/736x/0f/f6/70/0ff670e267968c07b364272d32001e6b.jpg',
  'https://i.pinimg.com/736x/9b/1a/75/9b1a756a8524c6e359ff53b0149e539a.jpg',
  'https://i.pinimg.com/736x/2f/57/c8/2f57c825825766c1fe7e224fb51c569c.jpg',
  'https://i.pinimg.com/736x/09/97/7d/09977df4076df7d3f456a31542a61071.jpg',
  'https://i.pinimg.com/736x/20/73/a1/2073a1c3c3c636c4d6159edcfb58fcab.jpg',
  'https://i.pinimg.com/736x/e9/da/62/e9da62436a490c880f97ec49c5369bf8.jpg',
  'https://i.pinimg.com/736x/82/19/39/821939834535109bc20a469f3515bbb9.jpg',
  'https://i.pinimg.com/736x/1a/1f/b2/1a1fb2334054aa974fe9b2e7f97a6e5d.jpg',
  'https://i.pinimg.com/736x/76/c1/2b/76c12bc9b0024209da2bb3921942065f.jpg',
  'https://i.pinimg.com/736x/cc/1e/5a/cc1e5abea44f898007322c902c68c065.jpg',
  'https://i.pinimg.com/736x/33/a1/3d/33a13d6d143877fc97c6f8a694ee838f.jpg',
  'https://i.pinimg.com/736x/90/e1/c8/90e1c8b1c9c8aba42a8302a8d0a6a37c.jpg',
  'https://i.pinimg.com/736x/ab/e3/c9/abe3c9c447a413b0f22d2db6b9f04ca6.jpg',
  'https://i.pinimg.com/736x/8e/ef/38/8eef38e0205439e61a00ef114dd5b1d2.jpg',
  'https://i.pinimg.com/736x/5c/70/a4/5c70a4c7b24513b76e3ebec311d7ac8f.jpg',
  'https://i.pinimg.com/736x/22/af/34/22af346989911eb247e42682181ecbd9.jpg',
  'https://i.pinimg.com/736x/b0/f9/00/b0f900f29a29d5f3fad18490fc636557.jpg',
  'https://i.pinimg.com/736x/38/d8/09/38d80953ceff77285901d66ff001bc64.jpg',
  'https://i.pinimg.com/736x/fe/d2/66/fed266035c876c08bafa6e637085dfc0.jpg',
  'https://i.pinimg.com/736x/15/40/b9/1540b9442ebc546eb8fdce801dd41e13.jpg',
  'https://i.pinimg.com/736x/3b/54/07/3b54070030dd24ba5526d191cbfeacbf.jpg',
  'https://i.pinimg.com/736x/9d/c4/04/9dc4041c6c0dd78c7a05577825fe5cbb.jpg',
  'https://i.pinimg.com/736x/7a/52/be/7a52bea027e0f20d92305fd3a1e4df9b.jpg',
  'https://i.pinimg.com/736x/52/e8/ef/52e8ef421e1256b96bbefd3c8e046293.jpg',
  'https://i.pinimg.com/736x/1f/2d/87/1f2d87a2eef76f3c81f3e1dcd08cb6eb.jpg',
  'https://i.pinimg.com/736x/dc/83/e9/dc83e95b3e4a7082942777e091365702.jpg',
  'https://i.pinimg.com/736x/57/e3/93/57e39348fe13ea76ab09a25fe40c7466.jpg',
  'https://i.pinimg.com/736x/da/6a/b3/da6ab3e497d0d7b20e9667e0392f1964.jpg',
  'https://i.pinimg.com/736x/34/65/5a/34655ab711c7ad30a35129b2957a88ff.jpg',
  'https://i.pinimg.com/736x/53/fd/2f/53fd2f49b3565f71c23c4b98b4bf927f.jpg',
  'https://i.pinimg.com/736x/b6/d8/3f/b6d83f7a71945b2a5dd0b3b20837bdd5.jpg',
  'https://i.pinimg.com/736x/bc/e9/52/bce9524a85af31ee525e54b578043784.jpg',
  'https://i.pinimg.com/736x/34/f6/5b/34f65b70f85161a3fe83120a5f29da72.jpg',
  'https://i.pinimg.com/736x/d7/e2/21/d7e2218debc728e7117776507cb81e74.jpg',
  'https://i.pinimg.com/736x/21/f3/cf/21f3cf89669cd8ef91902cb2da3b7b98.jpg',
  'https://i.pinimg.com/736x/09/93/1c/09931c58897d1c4918de5c2feda0c7ab.jpg',
  'https://i.pinimg.com/736x/3b/20/ae/3b20ae5972e217f0a9a5c3bcbc9442ed.jpg',
  'https://i.pinimg.com/736x/48/0f/de/480fded58aa7572d9061608a8e61377c.jpg',
  'https://i.pinimg.com/736x/d4/34/50/d43450ffd7def1b21424e576c86c2be8.jpg',
  'https://i.pinimg.com/736x/cc/c5/53/ccc5532d3cce47bc30975d3d3ef2c7c1.jpg',
  'https://i.pinimg.com/736x/bf/08/fc/bf08fcecb49a3b201ea63133cf6a9e55.jpg',
  'https://i.pinimg.com/736x/34/ce/8d/34ce8d8e2d5e8ea5ef949ab6a7d4eb4e.jpg',
  'https://i.pinimg.com/736x/12/b4/7a/12b47a813c8d31b7b4268f48b0d6fe92.jpg',
  'https://i.pinimg.com/736x/81/44/fc/8144fceaf431636b6b50aa418cf1600e.jpg',
  'https://i.pinimg.com/736x/17/8f/9c/178f9cca67d7c04192b70e98371d2ecf.jpg',
  'https://i.pinimg.com/736x/76/72/af/7672afbebbab0b51c51c68f351c9dc41.jpg',
  'https://i.pinimg.com/736x/97/d3/7a/97d37ac97a6fa483445c248429c38c4e.jpg',
  'https://i.pinimg.com/736x/5a/38/93/5a3893a4ad9e903416b25b24b76ecc1d.jpg',
  'https://i.pinimg.com/736x/1e/5c/d9/1e5cd93ff33e6ece30e9034a31f74a13.jpg',
  'https://i.pinimg.com/736x/fc/33/47/fc3347247c5fc2f9869ce7881af771a3.jpg',
  'https://i.pinimg.com/736x/bb/0a/86/bb0a8674dc26a1192a01c1a25f91afdd.jpg',
  'https://i.pinimg.com/736x/74/9a/b9/749ab9e3af7a45f830a08f83e530d797.jpg',
  'https://i.pinimg.com/736x/87/db/bd/87dbbdb3b4d7a6fd4f82fa5c170ffa4d.jpg',
  'https://i.pinimg.com/736x/a5/4c/86/a54c86d108835ce9d0a64d7388716828.jpg',
  'https://i.pinimg.com/736x/36/fb/fb/36fbfb6e1b75c333579448ad2e7c67d9.jpg',
  'https://i.pinimg.com/736x/3e/88/96/3e8896c8cb16393f0527aba424738455.jpg',
  'https://i.pinimg.com/736x/12/46/ff/1246ffee2a8dc2ada613a9c5521c2e27.jpg',
  'https://i.pinimg.com/736x/95/41/53/95415395c56b1f9fe5477c502588eb97.jpg',
  'https://i.pinimg.com/736x/db/d3/22/dbd322b316a85bbbe5132494bd05f19e.jpg',
  'https://i.pinimg.com/736x/94/e8/fa/94e8fa35e77f539f730c3bcb5b86d706.jpg',
  'https://i.pinimg.com/736x/68/16/68/68166839a1fcb7e48086d89c509ed08d.jpg',
  'https://i.pinimg.com/736x/67/39/52/67395209b2fc749ab255bf4b3a7059cb.jpg',
  'https://i.pinimg.com/736x/31/96/40/319640aaf1503bec53e5fd73aa5e0b7b.jpg',
  'https://i.pinimg.com/736x/0b/1e/96/0b1e965a0076f7806aa1ee9aa7d5f393.jpg',
  'https://i.pinimg.com/736x/6b/7d/d2/6b7dd2427eaeb96deada453a0e5d2a63.jpg',
  'https://i.pinimg.com/736x/30/5f/40/305f40220aaad0a69308e6760f1ab331.jpg',
  'https://i.pinimg.com/736x/f9/97/d7/f997d78d8cdf5b1dbfe5d49cdb3737c7.jpg',
  'https://i.pinimg.com/736x/ed/24/05/ed24058467f632e08c2384813c823acd.jpg',
  'https://i.pinimg.com/736x/32/f5/38/32f538e2b53c313bfbfe8ab769c4fc13.jpg',
  'https://i.pinimg.com/736x/15/80/80/1580801ff74691b59757c7a5eb15ca83.jpg',
  'https://i.pinimg.com/736x/0a/34/6d/0a346def45b3033f83a49d9242527a0b.jpg',
  'https://i.pinimg.com/736x/f4/c4/2e/f4c42e521207803dbea80869479d1464.jpg',
  'https://i.pinimg.com/736x/9d/f4/73/9df4738f1a42900bdbd8f9a6f334f88f.jpg',
  'https://i.pinimg.com/736x/62/2e/9f/622e9fb3997aa785cc0cb09576e6a277.jpg',
  'https://i.pinimg.com/736x/6f/ab/1f/6fab1fb952ff3f4f48498422e1e2660c.jpg',
  'https://i.pinimg.com/736x/3e/d7/7b/3ed77bd7cb46ad7d20009a2c179deb92.jpg',
  'https://i.pinimg.com/736x/f2/46/9a/f2469a65b3206943b63491bbf82d5b6c.jpg',
  'https://i.pinimg.com/736x/b4/fc/11/b4fc11a69a3e61d87088c23d002c5e88.jpg',
  'https://i.pinimg.com/736x/0c/c0/9e/0cc09e6b109375480dd48dcbf8fdd3ef.jpg',
  'https://i.pinimg.com/736x/63/46/87/63468734b422f18a15ae65ad56ff0312.jpg',
  'https://i.pinimg.com/736x/8d/03/2a/8d032a5fed44ed9c8fdb832aeacf6742.jpg',
  'https://i.pinimg.com/736x/94/30/bf/9430bfb8288064134cdf35628d17c1e8.jpg',
  'https://i.pinimg.com/736x/a6/dc/b1/a6dcb1e6958221cd1d1a5f300085f179.jpg',
  'https://i.pinimg.com/736x/1f/51/74/1f517410e885525cbc282f7e59411228.jpg',
  'https://i.pinimg.com/736x/57/33/eb/5733ebb36439cbb9bb6e284b969f49e9.jpg',
  'https://i.pinimg.com/736x/04/43/ce/0443ce3690882a1532245ce4961e0eaa.jpg',
  'https://i.pinimg.com/736x/26/e0/de/26e0de60e923809579da1b8f36ac8d48.jpg',
  'https://i.pinimg.com/736x/81/1d/20/811d2041374930f2bacdfd49daa11db6.jpg',
  'https://i.pinimg.com/736x/43/8d/0f/438d0f8de4d6448a0add288f9df8853d.jpg',
  'https://i.pinimg.com/736x/8b/48/73/8b487382eaa771eac0be0e5f483ff1ec.jpg',
  'https://i.pinimg.com/736x/9f/38/0f/9f380f097600f276901d8c424300dba6.jpg',
  'https://i.pinimg.com/736x/bc/ec/e4/bcece44216495f5f4066a6161639e26b.jpg',
  'https://i.pinimg.com/736x/f4/d3/6e/f4d36ea6c06e9d4258991793cb741f58.jpg',
  'https://i.pinimg.com/736x/8a/ac/0b/8aac0b50345c570b60d4068ab805ee4d.jpg',
  'https://i.pinimg.com/736x/6f/c2/b2/6fc2b222e0b765dbaff815530f3d00de.jpg',
  'https://i.pinimg.com/736x/36/7a/95/367a95268b2559abfb0b2ddb589d743b.jpg',
  'https://i.pinimg.com/736x/71/a7/01/71a7012722b4ff2b5c88a5b0ef6f0493.jpg',
  'https://i.pinimg.com/736x/03/10/91/031091ebd915c8fca50c353a2ecd5b95.jpg',
  'https://i.pinimg.com/736x/45/58/57/4558571ee3097feac7ef6e4fda1544ef.jpg',
  'https://i.pinimg.com/736x/32/11/c2/3211c257db875b74570982add056799f.jpg',
  'https://i.pinimg.com/736x/5d/c5/8e/5dc58e74f67c3c36086cf98a0de0ea72.jpg',
  'https://i.pinimg.com/736x/41/f6/8d/41f68dff293b28bd545e6700b1865a6a.jpg',
  'https://i.pinimg.com/736x/9a/23/73/9a2373a3c3a7e8c2c4d3f760a09637da.jpg',
  'https://i.pinimg.com/736x/e7/b0/8d/e7b08db1f81982d14ac6ae74244ad9e9.jpg',
  'https://i.pinimg.com/736x/6d/a0/75/6da0759db51c3305a91d4e762c9370d6.jpg',
  'https://i.pinimg.com/736x/fc/25/3a/fc253a34b878e3a06e4703fd7d79d302.jpg',
  'https://i.pinimg.com/736x/ef/e5/34/efe53471e4a2a122601b1f866646af51.jpg',
  'https://i.pinimg.com/736x/ed/8a/aa/ed8aaa7e98d7a6f1534ed05d712e8fc2.jpg',
  'https://i.pinimg.com/736x/c5/df/fe/c5dffe167562c19575994b91c7b41bc5.jpg',
  'https://i.pinimg.com/736x/2a/05/92/2a0592c49ad28fe68f32fefca8706ae7.jpg',
  'https://i.pinimg.com/736x/bc/e6/43/bce643fda6e23715afecc4d1895d82d6.jpg',
  'https://i.pinimg.com/736x/16/af/e1/16afe1a05e16524c72a139339ac1aea0.jpg',
  'https://i.pinimg.com/736x/cc/dc/ef/ccdcef128a1cda34f568a73196f12c7e.jpg',
  'https://i.pinimg.com/736x/a4/a0/cd/a4a0cdec84d30256ab36772dafaebe3e.jpg',
  'https://i.pinimg.com/736x/5e/cc/3f/5ecc3f65f1374e276fd9d10d51bf34eb.jpg',
  'https://i.pinimg.com/736x/c5/d9/68/c5d968de312be7aa0dc3628c3ea80696.jpg',
  'https://i.pinimg.com/736x/64/dd/64/64dd64454694fc7170fb7bd4b43fa565.jpg',
  'https://i.pinimg.com/736x/39/ae/b1/39aeb1e320c65a5205d25e897cfc4295.jpg',
  'https://i.pinimg.com/736x/9b/c2/df/9bc2df8ae6488616b2cc667aac47a478.jpg',
  'https://i.pinimg.com/736x/b8/bd/0c/b8bd0c2f46fedeef279d1c6aa1cbe77a.jpg',
  'https://i.pinimg.com/736x/35/5f/ed/355fed196ba653eef41994ac10a6d45b.jpg',
  'https://i.pinimg.com/736x/c6/3e/f0/c63ef0f098a16880d382e6414af090d6.jpg',
  'https://i.pinimg.com/736x/6e/23/2d/6e232dd6f8f5b40c76f64d4826dcb099.jpg',
  'https://i.pinimg.com/736x/02/4e/1a/024e1a3543796ef8d2504f708b9ca0b3.jpg',
  'https://i.pinimg.com/736x/12/2b/13/122b137990c463c9f4cb084f2595e963.jpg',
  'https://i.pinimg.com/736x/9f/1d/c5/9f1dc564ab4518ebc259e376fe9eb933.jpg',
  'https://i.pinimg.com/736x/0d/74/fd/0d74fd74ff620eacb5f687ab406f180f.jpg',
  'https://i.pinimg.com/736x/2c/1f/e1/2c1fe1ba632b527bc8065f2e74013117.jpg',
  'https://i.pinimg.com/736x/50/cf/d2/50cfd2bfbaf2e8858b7638d9af92fa8f.jpg',
  'https://i.pinimg.com/736x/a4/37/d1/a437d1071df467dc26961ad0ead5d417.jpg',
  'https://i.pinimg.com/736x/e2/44/d2/e244d2b57503124eebad11730933eaca.jpg',
  'https://i.pinimg.com/736x/49/fd/f3/49fdf3f91c1a5aa05dc2208be59b1b58.jpg',
  'https://i.pinimg.com/736x/38/11/9b/38119b73b2dfb7003350b63c13719859.jpg',
  'https://i.pinimg.com/736x/43/b7/25/43b7255fba43efd81b039b36963ec742.jpg',
  'https://i.pinimg.com/736x/6e/dd/50/6edd50b7a056dfc814f13935d594e36e.jpg',
  'https://i.pinimg.com/736x/16/99/27/169927ac2e94300d6f8e21400a1c372a.jpg',
  'https://i.pinimg.com/736x/84/e5/0a/84e50a4f2f1465f9da4b971449619e10.jpg',
  'https://i.pinimg.com/736x/66/59/0a/66590aa2b8554c409ab3fcd99b64048e.jpg',
  'https://i.pinimg.com/736x/d1/69/35/d16935252a1dab1724ac522ba61b55e8.jpg',
  'https://i.pinimg.com/736x/f1/d1/97/f1d19792982fff4981bafca62dcaff17.jpg',
  'https://i.pinimg.com/736x/0a/ff/7b/0aff7bba3d38af073629079327d4183f.jpg',
  'https://i.pinimg.com/736x/f5/fb/d1/f5fbd14677cf669466c9ab70caf24388.jpg',
  'https://i.pinimg.com/736x/75/bb/14/75bb1408faf65588d3793b5c60591eb8.jpg',
  'https://i.pinimg.com/736x/44/b2/b1/44b2b133dfc8775c057d9b170c2a4010.jpg',
  'https://i.pinimg.com/736x/5b/1a/d3/5b1ad3316592004720220a6bd1134ad4.jpg',
  'https://i.pinimg.com/736x/fd/5b/66/fd5b66ae00b8f72b996acb206361263e.jpg',
  'https://i.pinimg.com/736x/7a/3b/62/7a3b622287211428f76cdb33a26e0905.jpg',
  'https://i.pinimg.com/736x/c4/9e/f1/c49ef11e57182b9eda01fbf52a90a9e0.jpg',
  'https://i.pinimg.com/736x/86/c3/13/86c313d9fc74e4501056f40aa0276e72.jpg',
  'https://i.pinimg.com/736x/38/a4/b4/38a4b428fe918a65ba941370240fc759.jpg',
  'https://i.pinimg.com/736x/f1/72/0f/f1720f88e16c00d9350f3e39b688ee08.jpg',
  'https://i.pinimg.com/736x/b9/85/f8/b985f80b0c12a1ab32c2807aa29384d1.jpg',
  'https://i.pinimg.com/736x/42/70/ea/4270ea29abd18d60ad0f64ccd34dac9a.jpg',
  'https://i.pinimg.com/736x/55/1d/e6/551de63c7608a51a9b60c9f48c5af8d3.jpg',
  'https://i.pinimg.com/736x/98/e3/71/98e3711e5b0f52d8775346a7413cb68e.jpg',
  'https://i.pinimg.com/736x/f6/75/81/f675819b180a0283e15d8aa901d6379b.jpg',
  'https://i.pinimg.com/736x/e2/9d/91/e29d912a6200ce1bb067c372c589cb73.jpg',
  'https://i.pinimg.com/736x/ba/7e/33/ba7e33ccc3a0a982ac5b25a766dc7e26.jpg',
  'https://i.pinimg.com/736x/ad/77/27/ad7727393d2be6a83172ba04f62dc16f.jpg',
  'https://i.pinimg.com/736x/94/6f/92/946f9212af87c12d5a2ada9eb6ce6b81.jpg',
  'https://i.pinimg.com/736x/a6/a7/bb/a6a7bb9d945b3b49330736f73fe06023.jpg',
  'https://i.pinimg.com/736x/e7/a9/37/e7a93729c7343e949b5e218c654d4acc.jpg',
  'https://i.pinimg.com/736x/92/8e/c0/928ec093b018a6bda0f99dd48e7180ee.jpg',
  'https://i.pinimg.com/736x/a0/9c/1f/a09c1f0e6a79b1722ca56b59e7bbc461.jpg',
  'https://i.pinimg.com/736x/1a/28/de/1a28ded60fb9846261fe6de9767303e4.jpg',
  'https://i.pinimg.com/736x/ab/bb/8a/abbb8aa6af3faf425cac07a5c655e840.jpg',
  'https://i.pinimg.com/736x/11/76/d6/1176d69acae55c9e2955c4414cb2be58.jpg',
  'https://i.pinimg.com/736x/6d/7f/0b/6d7f0bc8c0d4d7a4dbafb8da80f62319.jpg',
  'https://i.pinimg.com/736x/17/d7/35/17d735e0491c094520a40b16f80d7f71.jpg',
  'https://i.pinimg.com/736x/df/9c/37/df9c37452e512bd219d265a7edaf38a1.jpg',
  'https://i.pinimg.com/736x/1b/12/db/1b12dbc4d947971b53b02d5efcabeeab.jpg',
  'https://i.pinimg.com/736x/5d/1f/fa/5d1ffa50fd5497ec6c7d40bb2804ea44.jpg',
  'https://i.pinimg.com/736x/ad/e2/b3/ade2b307b0b0779af90684b41fe95b7f.jpg',
  'https://i.pinimg.com/736x/d6/2b/1a/d62b1ae76fe1e6ae9d7ef06df7d13418.jpg',
  'https://i.pinimg.com/736x/db/8b/90/db8b90db2eb6ebab8fb5445509169ae4.jpg',
  'https://i.pinimg.com/736x/a0/1a/ef/a01aefab314a2fd00fb01c570a50f303.jpg',
  'https://i.pinimg.com/736x/d0/2c/70/d02c7081362a6dd0d6f48afa2a52a144.jpg',
  'https://i.pinimg.com/736x/24/f6/e6/24f6e63a1fd977ee084702983ec303df.jpg',
  'https://i.pinimg.com/736x/0e/d9/d0/0ed9d0f69021eb1f6fd292f05c24f77d.jpg',
  'https://i.pinimg.com/736x/17/1b/e7/171be70beb7a1ff6710fd2f0b2ba636a.jpg',
  'https://i.pinimg.com/736x/b7/b3/d0/b7b3d0bdf8160e023835662bca08444f.jpg',
  'https://i.pinimg.com/736x/c0/b7/32/c0b7326f9d2e84ec5e13f20128d1799e.jpg',
  'https://i.pinimg.com/736x/bb/bb/9b/bbbb9b863b53c346353c2e613d83f48b.jpg',
  'https://i.pinimg.com/736x/e3/c6/40/e3c6403c078eada23adf46fb7aa6ebf6.jpg',
  'https://i.pinimg.com/736x/cc/f3/08/ccf308902d9a67c4d6a04ef9659e9046.jpg',
  'https://i.pinimg.com/736x/f9/6c/d4/f96cd430050f56bc5b6ca81fc32c7512.jpg',
  'https://i.pinimg.com/736x/35/3a/5e/353a5e01d49a52bbcca5adf52dea6cf9.jpg',
  'https://i.pinimg.com/736x/02/d9/a3/02d9a3313315033df0dcd61b43ebbae7.jpg',
  'https://i.pinimg.com/736x/9e/4b/c0/9e4bc0337bc78fbee7a13e570d687fb7.jpg',
  'https://i.pinimg.com/736x/39/af/4a/39af4abd10cc3eeed3f27a8ef43714e2.jpg',
  'https://i.pinimg.com/736x/7c/8d/bf/7c8dbfeef590c97f632d2e2f80740221.jpg',
  'https://i.pinimg.com/736x/a2/dd/4d/a2dd4d4541b96a92ef780d3f3e3fab9d.jpg',
  'https://i.pinimg.com/736x/b7/2f/92/b72f929a5c65f2013305d7628a790840.jpg',
  'https://i.pinimg.com/736x/97/41/a4/9741a47fab198b8c5e9d0046fd6ee992.jpg',
  'https://i.pinimg.com/736x/92/07/ea/9207ea17620c6da635fdf20e5391a14b.jpg',
  'https://i.pinimg.com/736x/ec/21/7f/ec217fd4b858404b16fd50c6f0fd5064.jpg',
  'https://i.pinimg.com/736x/22/d8/08/22d8082a63cd657a7f6021420e1cc711.jpg',
  'https://i.pinimg.com/736x/db/b9/04/dbb90469dc3c1f2477599674de30dd3f.jpg',
  'https://i.pinimg.com/736x/4e/56/70/4e5670f0ea093b8abb56af0ead94439a.jpg',
  'https://i.pinimg.com/736x/dc/e4/5b/dce45bd3885e7a3f6eba6b93743add88.jpg',
  'https://i.pinimg.com/736x/a0/e3/08/a0e308bea9b3c98ff95159009e170f61.jpg',
  'https://i.pinimg.com/736x/43/36/4e/43364ece75dbb307d18a9bc63135c710.jpg',
  'https://i.pinimg.com/736x/02/7b/f6/027bf63da9327b123ee636c0fc018d3c.jpg',
  'https://i.pinimg.com/736x/31/24/25/312425632efbfd53ab8fb964d2babf6b.jpg',
  'https://i.pinimg.com/736x/ec/ac/f6/ecacf6201af9013adde860e436e1f306.jpg',
  'https://i.pinimg.com/736x/19/93/0c/19930c5059e30e49b90203de99ea2b0e.jpg',
  'https://i.pinimg.com/736x/c4/0b/f8/c40bf8d6c6eefa9b6f15d1f59dd59ce5.jpg',
  'https://i.pinimg.com/736x/82/76/08/82760864c5115972b6ebf497dcd5d3d1.jpg',
  'https://i.pinimg.com/736x/10/61/a4/1061a4135737c675a2901d5de5d3d054.jpg',
  'https://i.pinimg.com/736x/a3/ff/0d/a3ff0db8ed5b47cd63d0b0f07ebd8575.jpg',
  'https://i.pinimg.com/736x/58/5a/9a/585a9a9b120dd0974d9c125840663693.jpg',
  'https://i.pinimg.com/736x/65/e3/04/65e304ac7303bc493b7105f93dc81ea1.jpg',
  'https://i.pinimg.com/736x/da/c7/3b/dac73beee0ce3fe18d2d261f999434d7.jpg',
  'https://i.pinimg.com/736x/7a/19/cb/7a19cbdf96c19bda3e3fa0bc738f462f.jpg',
  'https://i.pinimg.com/736x/fb/33/63/fb3363ae66bfc566615d33517c9bce9b.jpg',
  'https://i.pinimg.com/736x/5f/b7/95/5fb795872ee85419abeebdfc4f38a13c.jpg',
  'https://i.pinimg.com/736x/c4/22/c1/c422c14a2b9f501d21e9fe59dbf0a957.jpg',
  'https://i.pinimg.com/736x/fa/64/61/fa646156c47deba7c77929f23541bb8b.jpg',
  'https://i.pinimg.com/736x/cb/7c/a4/cb7ca4e2fa2a8ce045c0486ab33b1b75.jpg',
  'https://i.pinimg.com/736x/bb/67/e8/bb67e888da3640077c4732f6930e6329.jpg',
  'https://i.pinimg.com/736x/1a/cf/32/1acf32a7cc84eeadf3928bd60e62069a.jpg',
  'https://i.pinimg.com/736x/d4/f7/4a/d4f74a6baa0e8caa9811762f25c2251e.jpg',
  'https://i.pinimg.com/736x/4e/80/9e/4e809ed618f971d89f57c89a714a039c.jpg',
  'https://i.pinimg.com/736x/af/ce/be/afcebebaaecf2d616a9cf7cae3de821c.jpg',
  'https://i.pinimg.com/736x/8b/d7/63/8bd763b01bc1182bb7266c7a44d61208.jpg',
  'https://i.pinimg.com/736x/4a/1d/aa/4a1daa5613cda5d84e2294db855cbe1f.jpg',
  'https://i.pinimg.com/736x/fe/25/65/fe2565fc48ef4f03d4da5d9b0eeb1d56.jpg',
  'https://i.pinimg.com/736x/f7/65/78/f76578e453cebb465e985ce061b5f297.jpg',
  'https://i.pinimg.com/736x/f9/5d/07/f95d07d4a7450a3f1caf65959a4ca8cb.jpg',
  'https://i.pinimg.com/736x/97/2f/f4/972ff40ad63b11499f82e8b6fef9a761.jpg',
  'https://i.pinimg.com/736x/78/9b/79/789b79850094252bde0a9cec23fdf8d5.jpg',
  'https://i.pinimg.com/736x/8b/3f/42/8b3f4242a4abed56edb3f54f754ebb13.jpg',
  'https://i.pinimg.com/736x/ac/99/36/ac9936a2f8d6fdd70586df97cd71c072.jpg',
  'https://i.pinimg.com/736x/5e/b2/30/5eb230da7c789e82c962186ffaddedf4.jpg',
  'https://i.pinimg.com/736x/c6/5b/56/c65b56351071b402c32aed73a3287a71.jpg',
  'https://i.pinimg.com/736x/d7/42/20/d742202c75fad9342f0cabfc8aa917c0.jpg',
  'https://i.pinimg.com/736x/96/46/7b/96467b70cffd3674919a1b179e5b33d5.jpg',
  'https://i.pinimg.com/736x/15/48/8e/15488e1bb8785217ec544b269afd1e18.jpg',
  'https://i.pinimg.com/736x/d0/c3/8d/d0c38dbe75f5b62f8dd2982a1c9b853c.jpg',
  'https://i.pinimg.com/736x/1c/d2/bd/1cd2bd65c5f06ae41d2ff05b45e28184.jpg',
  'https://i.pinimg.com/736x/4b/24/7b/4b247b4dfd0836c73f209b887da8f23c.jpg',
  'https://i.pinimg.com/736x/d4/c5/f9/d4c5f9e989f0c7542db2dee89c447381.jpg',
  'https://i.pinimg.com/736x/02/7e/6f/027e6f61d8b8399bc0e9fcd2da8d79b1.jpg',
  'https://i.pinimg.com/736x/90/50/9e/90509ed0582a6a038b89fcc935aecff0.jpg',
  'https://i.pinimg.com/736x/a8/04/a6/a804a6a9314c60823911e20986e87049.jpg',
  'https://i.pinimg.com/736x/e6/a6/0b/e6a60b7bdbf73fbdcd2c2da14865b4d2.jpg',
  'https://i.pinimg.com/736x/f0/81/be/f081be14aa92e310684566969b4e017d.jpg',
  'https://i.pinimg.com/736x/3f/a3/ea/3fa3ea7ffd1ca629a518f09ac394a801.jpg',
  'https://i.pinimg.com/736x/67/d9/5f/67d95f5e875f7ee3fcf09c4f9cf530a4.jpg',
  'https://i.pinimg.com/736x/20/9c/57/209c577b23676b6674542d4b604c672c.jpg',
  'https://i.pinimg.com/736x/97/aa/4a/97aa4af0cc8bbfc491cb36b3a7096490.jpg',
  'https://i.pinimg.com/736x/a8/f6/0a/a8f60ad89c6a6a86f9e9b8673e14acd7.jpg',
  'https://i.pinimg.com/736x/de/1f/52/de1f52fd15f501a62953b2a11f7d37a2.jpg',
  'https://i.pinimg.com/736x/59/53/35/595335cdb87c9625f628885a53467bec.jpg',
  'https://i.pinimg.com/736x/1e/f5/8d/1ef58d8abfc3cfd15795922ed7a262e4.jpg',
  'https://i.pinimg.com/736x/0e/83/20/0e83209912fcf0b0ddc39abfeb30b748.jpg',
  'https://i.pinimg.com/736x/fa/50/a8/fa50a8c54ebf1d5605396417a4646da3.jpg',
  'https://i.pinimg.com/736x/b8/ea/17/b8ea172f8a3d124838b6fdcbc2192ae4.jpg',
  'https://i.pinimg.com/736x/4d/17/72/4d17729981b699c604e482790658a5e4.jpg',
  'https://i.pinimg.com/736x/cd/da/d8/cddad8f6119e4a3482f8631c7b7c5c7b.jpg',
  'https://i.pinimg.com/736x/64/02/9f/64029fd273e1803386f422487f71bdac.jpg',
  'https://i.pinimg.com/736x/db/a4/88/dba4881b5c5d3db79e7ac784a6d9cc19.jpg',
  'https://i.pinimg.com/736x/78/54/9f/78549f909b7035d0bec383be19d76d51.jpg',
  'https://i.pinimg.com/736x/66/0c/b2/660cb205976f12344911188a2a7aa895.jpg',
  'https://i.pinimg.com/736x/56/43/94/5643948bac5aacda0bb3eae81f6a5353.jpg',
  'https://i.pinimg.com/736x/77/1b/6c/771b6cf2bc4965ce32565f86b16a807f.jpg',
  'https://i.pinimg.com/736x/76/b4/b1/76b4b162bac280d5ddc7426cb36003e4.jpg',
];

// Track used avatars to prevent duplicates
let usedFemaleAvatars = new Set();
let usedMaleAvatars = new Set();

/**
 * Get avatar URL matching user's gender
 * @param {string} gender - 'male' or 'female'
 * @param {string} name - User's name for uniqueness
 * @returns {string}
 */
const getGenderMatchedAvatar = (gender, name) => {
  const isFemale = gender === 'female';
  const avatarList = isFemale ? VIETNAMESE_FEMALE_AVATARS : VIETNAMESE_MALE_AVATARS;
  const usedSet = isFemale ? usedFemaleAvatars : usedMaleAvatars;

  // Filter out used avatars
  let availableAvatars = avatarList.filter(url => !usedSet.has(url));

  // Reset if all used
  if (availableAvatars.length === 0) {
    if (isFemale) {
      usedFemaleAvatars.clear();
    } else {
      usedMaleAvatars.clear();
    }
    availableAvatars = [...avatarList];
  }

  // Pick random from available
  const selectedAvatar = availableAvatars[Math.floor(Math.random() * availableAvatars.length)];

  // Mark as used
  usedSet.add(selectedAvatar);

  // Add unique seed based on name to create variation
  const nameSeed = name.replace(/\s+/g, '').toLowerCase();
  if (selectedAvatar.includes('pravatar')) {
    return selectedAvatar; // pravatar uses img param already
  } else if (selectedAvatar.includes('dicebear')) {
    return selectedAvatar.replace(/seed=[^&]+/, `seed=${nameSeed}`);
  }

  return selectedAvatar;
};

/**
 * Reset avatar trackers (call before new batch generation)
 */
const resetAvatarTrackers = () => {
  usedFemaleAvatars.clear();
  usedMaleAvatars.clear();
  console.log('[SeedUserGenerator] Reset avatar trackers');
};

/**
 * Generate placeholder avatar URL
 * @param {string} name - User name
 * @param {string} gender - User gender
 * @returns {string}
 */
const generatePlaceholderAvatar = (name, gender) => {
  // Use UI Avatars as fallback
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2);

  const colors = ['1abc9c', '2ecc71', '3498db', '9b59b6', 'e91e63', 'f39c12', 'e74c3c'];
  const bgColor = getRandomItem(colors);

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bgColor}&color=fff&size=200`;
};

/**
 * Generate a single seed user object
 * @param {Object} options - Options
 * @returns {Object}
 */
const generateUserData = ({
  isPremium = false,
  createdAt = null,
} = {}) => {
  const { fullName, gender, isVietEnglish } = generateVietnameseName();
  const persona = getPersonaByDistribution();

  // Premium users have more followers
  const followersCount = isPremium
    ? getRandomNumber(200, 1000)
    : getRandomNumber(10, 300);

  const followingCount = getRandomNumber(50, Math.min(500, followersCount * 2));

  // Generate created_at spread over 6 months
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const userCreatedAt = createdAt || getRandomDate(sixMonthsAgo, now);

  // Generate bio
  const bio = generateBio(persona, isPremium);

  // Generate avatar MATCHING GENDER
  const avatarUrl = getGenderMatchedAvatar(gender, fullName);

  // Generate tier
  const tier = isPremium ? getRandomItem(['premium', 'vip']) : getRandomTier();

  // Location
  const location = getRandomItem(VIETNAMESE_LOCATIONS);

  // Generate unique ID and email
  const uniqueId = uuidv4();
  const emailName = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '');
  const email = `${emailName}.${uniqueId.substring(0, 8)}@seed.gemral.app`;

  return {
    id: uniqueId,
    email,
    full_name: fullName,
    avatar_url: avatarUrl,
    bio,
    location,
    tier,
    followers_count: followersCount,
    following_count: followingCount,
    seed_persona: persona,
    is_premium_seed: isPremium,
    bot_enabled: true,
    created_at: userCreatedAt.toISOString(),
    updated_at: new Date().toISOString(),
    // Note: gender is used for avatar selection but not stored in DB
  };
};

/**
 * Generate seed users
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Result with counts
 */
export const generate = async ({
  totalCount = 500,
  premiumCount = 100,
  onProgress = null,
  generatedBy = null,
} = {}) => {
  console.log(`[SeedUserGenerator] Starting generation of ${totalCount} users (${premiumCount} premium)`);

  // Reset avatar trackers to prevent duplicates
  resetAvatarTrackers();

  const results = {
    generated: 0,
    failed: 0,
    errors: [],
  };

  try {
    if (onProgress) {
      onProgress({
        phase: 'generating',
        message: 'Đang tạo users với avatar theo giới tính...',
        current: 0,
        total: totalCount,
      });
    }

    // Generate users
    const users = [];
    const regularCount = totalCount - premiumCount;

    // Generate premium users first
    for (let i = 0; i < premiumCount; i++) {
      const user = generateUserData({
        isPremium: true,
      });
      users.push(user);
    }

    // Generate regular users
    for (let i = 0; i < regularCount; i++) {
      const user = generateUserData({
        isPremium: false,
      });
      users.push(user);
    }

    console.log(`[SeedUserGenerator] Generated ${users.length} user objects with gender-matched avatars`);

    // Shuffle users
    users.sort(() => Math.random() - 0.5);

    // Insert in batches
    const totalBatches = Math.ceil(users.length / BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, users.length);
      const batch = users.slice(start, end);

      if (onProgress) {
        onProgress({
          phase: 'inserting',
          message: `Đang tạo users (${start + 1}-${end}/${users.length})...`,
          current: start,
          total: users.length,
        });
      }

      try {
        const { data, error } = await supabase
          .from('seed_users')
          .insert(batch)
          .select('id');

        if (error) {
          console.error(`[SeedUserGenerator] Batch ${batchIndex + 1} error:`, error);
          results.failed += batch.length;
          results.errors.push({
            batch: batchIndex + 1,
            error: error.message,
          });
        } else {
          results.generated += data?.length || batch.length;
        }
      } catch (batchError) {
        console.error(`[SeedUserGenerator] Batch ${batchIndex + 1} exception:`, batchError);
        results.failed += batch.length;
        results.errors.push({
          batch: batchIndex + 1,
          error: batchError.message,
        });
      }

      // Small delay between batches to avoid rate limiting
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Log generation
    await logGeneration({
      generationType: 'users',
      countGenerated: results.generated,
      countFailed: results.failed,
      parameters: {
        totalCount,
        premiumCount,
      },
      errorDetails: results.errors.length > 0 ? results.errors : null,
      generatedBy,
    });

    if (onProgress) {
      onProgress({
        phase: 'completed',
        message: `Hoàn thành! Đã tạo ${results.generated} users.`,
        current: results.generated,
        total: totalCount,
      });
    }

    console.log(`[SeedUserGenerator] Generation completed: ${results.generated} created, ${results.failed} failed`);

    return results;
  } catch (error) {
    console.error('[SeedUserGenerator] Generation error:', error);
    results.errors.push({
      type: 'general',
      error: error.message,
    });

    // Log failed generation
    await logGeneration({
      generationType: 'users',
      countGenerated: results.generated,
      countFailed: results.failed + (totalCount - results.generated - results.failed),
      parameters: {
        totalCount,
        premiumCount,
      },
      errorDetails: results.errors,
      generatedBy,
    });

    throw error;
  }
};

/**
 * Get seed users for bot actions
 * @param {number} count - Number of users needed
 * @param {string} excludeUserId - User ID to exclude
 * @param {string} preferredPersona - Preferred persona
 * @returns {Promise<Array>}
 */
export const getRandomSeedUsers = async (count, excludeUserId = null, preferredPersona = null) => {
  try {
    // Try with persona filter first
    if (preferredPersona) {
      let query = supabase
        .from('seed_users')
        .select('id, full_name, avatar_url, seed_persona')
        .eq('bot_enabled', true)
        .eq('seed_persona', preferredPersona)
        .limit(count);

      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }

      const { data, error } = await query;

      if (!error && data?.length >= count) {
        // Shuffle and return
        return data.sort(() => Math.random() - 0.5);
      }
    }

    // Fallback to any seed user
    let query = supabase
      .from('seed_users')
      .select('id, full_name, avatar_url, seed_persona')
      .eq('bot_enabled', true)
      .limit(count * 3); // Get more to randomize

    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[SeedUserGenerator] getRandomSeedUsers error:', error);
      return [];
    }

    // Shuffle and take needed count
    const shuffled = (data || []).sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('[SeedUserGenerator] getRandomSeedUsers error:', error);
    return [];
  }
};

/**
 * Get premium seed users
 * @param {number} limit - Max number to return
 * @returns {Promise<Array>}
 */
export const getPremiumSeedUsers = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('seed_users')
      .select('id, full_name, avatar_url, seed_persona, bio')
      .eq('is_premium_seed', true)
      .limit(limit);

    if (error) {
      console.error('[SeedUserGenerator] getPremiumSeedUsers error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[SeedUserGenerator] getPremiumSeedUsers error:', error);
    return [];
  }
};

/**
 * Get seed users by persona
 * @param {string} persona - Persona type
 * @param {number} limit - Max number to return
 * @returns {Promise<Array>}
 */
export const getSeedUsersByPersona = async (persona, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('seed_users')
      .select('id, full_name, avatar_url, seed_persona, bio')
      .eq('seed_persona', persona)
      .limit(limit);

    if (error) {
      console.error('[SeedUserGenerator] getSeedUsersByPersona error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[SeedUserGenerator] getSeedUsersByPersona error:', error);
    return [];
  }
};

/**
 * Update seed user avatar
 * @param {string} userId - User ID
 * @param {string} avatarUrl - New avatar URL
 * @returns {Promise<boolean>}
 */
export const updateSeedUserAvatar = async (userId, avatarUrl) => {
  try {
    const { error } = await supabase
      .from('seed_users')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('[SeedUserGenerator] updateSeedUserAvatar error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[SeedUserGenerator] updateSeedUserAvatar error:', error);
    return false;
  }
};

/**
 * Batch update seed user avatars from uploaded URLs
 * @param {Array<{userId: string, avatarUrl: string}>} updates - Array of updates
 * @returns {Promise<Object>}
 */
export const batchUpdateAvatars = async (updates) => {
  const results = {
    updated: 0,
    failed: 0,
  };

  for (const { userId, avatarUrl } of updates) {
    const success = await updateSeedUserAvatar(userId, avatarUrl);
    if (success) {
      results.updated++;
    } else {
      results.failed++;
    }
  }

  return results;
};

export default {
  generate,
  getRandomSeedUsers,
  getPremiumSeedUsers,
  getSeedUsersByPersona,
  updateSeedUserAvatar,
  batchUpdateAvatars,
};
