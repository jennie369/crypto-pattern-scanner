/**
 * Gemral - Seed Post Generator
 * Generates realistic seed posts with templates and variables
 */

import { supabase } from '../supabase';
import {
  POST_TEMPLATES,
  TRADING_VARIABLES,
  CRYSTAL_VARIABLES,
  LOA_VARIABLES,
  TOPIC_WEIGHTS,
  PERSONA_TOPIC_PREFERENCE,
  getRandomItem,
  getRandomItems,
  getRandomNumber,
  getRandomFloat,
  getTopicByDistribution,
} from './seedDatasets';
import { logGeneration } from './seedContentService';
import { getPremiumSeedUsers, getSeedUsersByPersona } from './seedUserGenerator';
import { GENDER_POST_IMAGES, FEMALE_AVATAR_PATTERNS } from './genderPostImages';

// Batch size for database inserts
const BATCH_SIZE = 20;

/**
 * Sanitize text to remove invalid unicode surrogates
 * @param {string} text - Text to sanitize
 * @returns {string}
 */
const sanitizeText = (text) => {
  if (!text) return '';
  // Remove unpaired surrogates (invalid unicode)
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');
};

/**
 * Detect gender from avatar URL
 * Uses FEMALE_AVATAR_PATTERNS to identify female users
 * @param {string} avatarUrl - User's avatar URL
 * @returns {'male' | 'female'}
 */
const detectGenderFromAvatar = (avatarUrl) => {
  if (!avatarUrl) return 'male';
  // Check if avatar URL contains any female avatar pattern
  const isFemale = FEMALE_AVATAR_PATTERNS.some(pattern => avatarUrl.includes(pattern));
  return isFemale ? 'female' : 'male';
};

/**
 * Post images - NGƯỜI CHÂU Á / VIỆT NAM / DOUYIN STYLE
 *
 * Sử dụng hình từ Unsplash với keyword "asian" để có hình người châu Á
 * Phong cách: Social media, lifestyle, đời thường, Douyin/TikTok aesthetic
 *
 * BẮT BUỘC có người trong hình - không dùng objects only
 */

/**
 * Curated image arrays - NGƯỜI CHÂU Á trong mỗi hình
 * Đã chọn lọc từ Unsplash với keyword asian woman, asian man, vietnamese, etc.
 */
const SAMPLE_IMAGES = {
  trading: [
    'https://i.pinimg.com/736x/ed/30/52/ed30522f8dfab2e5c0ebbf42e25f5915.jpg',
    'https://i.pinimg.com/736x/fd/7a/bb/fd7abb60bab1a3a7218cc70da6d18fc4.jpg',
    'https://i.pinimg.com/736x/7e/df/b0/7edfb00f51f5a537ca1e59fbb466c240.jpg',
    'https://i.pinimg.com/736x/aa/05/ba/aa05bac33d749764243e5ba794e67dd3.jpg',
    'https://i.pinimg.com/736x/9e/fc/8f/9efc8f6e038b1b184209ae632c7d9d75.jpg',
    'https://i.pinimg.com/736x/93/a9/70/93a9704a2cb7fcb0c1e4f633104f2fc1.jpg',
    'https://i.pinimg.com/736x/88/01/56/8801561230ed39b87d9ab687274eb4c3.jpg',
    'https://i.pinimg.com/736x/63/d4/c4/63d4c4a79ffb695236774fde51fd16f6.jpg',
    'https://i.pinimg.com/736x/0f/58/5b/0f585bf8b53fe8918845ca27634082f2.jpg',
    'https://i.pinimg.com/736x/ac/ef/6a/acef6ac0a2bb992e70f942540613b783.jpg',
    'https://i.pinimg.com/736x/ee/a7/cd/eea7cdc543bd98a8196d388151dd1c59.jpg',
    'https://i.pinimg.com/736x/4b/08/06/4b08063230fc9727f449c3a85aecb9d6.jpg',
    'https://i.pinimg.com/736x/5d/94/44/5d94442b4a4b9843c6062715fe283421.jpg',
    'https://i.pinimg.com/736x/4d/2c/2e/4d2c2e50743c751c4c1b2eeeb0ce2b24.jpg',
    'https://i.pinimg.com/736x/75/49/27/75492783bdadde0d9e0ac998d106cb84.jpg',
    'https://i.pinimg.com/736x/c6/2a/0c/c62a0cd40b9052f05f579f6d2354adce.jpg',
    'https://i.pinimg.com/736x/c8/dc/16/c8dc16ca3ef2f9fa4e07742a5ce46326.jpg',
    'https://i.pinimg.com/736x/3d/9a/e3/3d9ae3320dc8fe33273694f58621f6b2.jpg',
    'https://i.pinimg.com/736x/59/1b/b8/591bb8b5a9d3ad290102f6a629b5553b.jpg',
    'https://i.pinimg.com/736x/59/50/9d/59509d954465a19b2659decd52f52db1.jpg',
    'https://i.pinimg.com/736x/ca/6e/92/ca6e92c543650e8c5cc418cbb18697ee.jpg',
    'https://i.pinimg.com/736x/9f/4e/a7/9f4ea749588b12bb1e321f91356fd2f3.jpg',
    'https://i.pinimg.com/736x/02/5b/bd/025bbdf9348f578dfe5413fd581cbc09.jpg',
    'https://i.pinimg.com/736x/22/e2/da/22e2da2569c0533223c5e9a30cb4dcd1.jpg',
    'https://i.pinimg.com/736x/73/aa/9e/73aa9e7ed3c6eac4bb5063bc339860fd.jpg',
    'https://i.pinimg.com/736x/3d/c8/e8/3dc8e8b994da0a3f13fa6067fd5bf491.jpg',
    'https://i.pinimg.com/736x/03/dc/95/03dc951232ff183488d46830f2c92496.jpg',
    'https://i.pinimg.com/736x/7d/bd/cf/7dbdcf75047253fae26e81dbd04a245a.jpg',
    'https://i.pinimg.com/736x/7a/05/1b/7a051bcbe317c773b9e65f272f92c9ad.jpg',
    'https://i.pinimg.com/736x/9d/ce/1e/9dce1edb157d16ad950d4012b48a599b.jpg',
    'https://i.pinimg.com/736x/32/07/83/3207830f198ebcab3987d0a2dddaf245.jpg',
    'https://i.pinimg.com/736x/1c/df/07/1cdf07eafaceec27e96cf17b048502df.jpg',
    'https://i.pinimg.com/736x/a8/8c/29/a88c291f37fca4c690785b117fb3b6cc.jpg',
    'https://i.pinimg.com/736x/4b/59/0c/4b590c1e90cd6e5d9bd45e42da064c90.jpg',
    'https://i.pinimg.com/736x/28/f1/9e/28f19e3902dc2504c0436da919c3c84b.jpg',
    'https://i.pinimg.com/736x/a3/44/52/a3445225b037a30062c3320e41683f6e.jpg',
    'https://i.pinimg.com/736x/3a/73/0b/3a730b5544b5110226acf876fa38f3f7.jpg',
    'https://i.pinimg.com/736x/2b/a1/2b/2ba12bc81544c6f19dd021ab501c768e.jpg',
    'https://i.pinimg.com/736x/12/3d/39/123d3940e5929f87138842f1aba4fd27.jpg',
    'https://i.pinimg.com/736x/30/a3/e8/30a3e8becb7bd037487ea40ce39aaee1.jpg',
    'https://i.pinimg.com/736x/b8/a3/e5/b8a3e57728df13532bb1c8de50f31fda.jpg',
    'https://i.pinimg.com/736x/11/f4/ff/11f4fff41eac7ad37ec5d970a03ce546.jpg',
    'https://i.pinimg.com/736x/14/1b/31/141b313b71e9725583919f6c33d07d52.jpg',
    'https://i.pinimg.com/736x/b7/ab/53/b7ab53f0536381f666736d7e18065247.jpg',
    'https://i.pinimg.com/736x/2c/3e/8d/2c3e8d1dac758d6cc64bdd7451d6441c.jpg',
    'https://i.pinimg.com/736x/68/0a/0a/680a0a7e486f477a99de2d237677b0b8.jpg',
    'https://i.pinimg.com/736x/7b/1b/f1/7b1bf19a0745f27e465d6ef46c030a6c.jpg',
    'https://i.pinimg.com/736x/28/b0/c0/28b0c03956e84324715cfbc3f9ff5a9a.jpg',
    'https://i.pinimg.com/736x/23/2d/b6/232db6356db51f6a253b2f31ad8760b7.jpg',
    'https://i.pinimg.com/736x/e4/eb/d8/e4ebd8098c63fb6b18a00fda0ab029bd.jpg',
    'https://i.pinimg.com/736x/4a/9c/73/4a9c73415e600e994b352f73160f06e7.jpg',
    'https://i.pinimg.com/736x/c3/bb/63/c3bb63a125066c2f2253a874b1eb46c0.jpg',
    'https://i.pinimg.com/736x/c1/9b/e2/c19be261ee1849d7d09c7548fa85692b.jpg',
    'https://i.pinimg.com/736x/4b/aa/59/4baa591a1b3d393d297346033e6b6040.jpg',
    'https://i.pinimg.com/736x/0c/8f/88/0c8f8831292530e4218996417b568ff4.jpg',
    'https://i.pinimg.com/736x/99/1a/75/991a7525c4cbb762f1a6629826672199.jpg',
    'https://i.pinimg.com/736x/41/e8/44/41e84444d52b46c52beed660daf5ada0.jpg',
    'https://i.pinimg.com/736x/69/b0/31/69b0314f92319565a483aab428453429.jpg',
    'https://i.pinimg.com/736x/85/76/80/85768013280fc46d1d53c8422dfe3769.jpg',
    'https://i.pinimg.com/736x/95/15/1a/95151a3329fcc57113c37df24253c9ca.jpg',
    'https://i.pinimg.com/736x/e1/b0/2b/e1b02b62c3c3b82c0001e6a1a2f3d0f2.jpg',
    'https://i.pinimg.com/736x/99/c3/cc/99c3ccb8e671ac551e292b6f37be14b2.jpg',
    'https://i.pinimg.com/736x/b1/b1/47/b1b147f36161d052a1e75819a2ad269e.jpg',
    'https://i.pinimg.com/736x/61/c4/18/61c4184271006ff74452e62d13f1af46.jpg',
    'https://i.pinimg.com/736x/49/96/43/499643fc6acc905a7f03167573d88e51.jpg',
    'https://i.pinimg.com/736x/1f/4f/23/1f4f237e820f9fb04a116af60f3c6c97.jpg',
    'https://i.pinimg.com/736x/ca/47/63/ca47632b8fd94153a7faeb30423aa193.jpg',
    'https://i.pinimg.com/736x/f0/b5/74/f0b574fa305a00257bed98189c2130fa.jpg',
    'https://i.pinimg.com/736x/38/f3/14/38f314e63c8ec487135834d9d3634244.jpg',
    'https://i.pinimg.com/736x/1e/c8/e3/1ec8e3a8d1c6104b881277227f73835a.jpg',
    'https://i.pinimg.com/736x/d0/ea/28/d0ea2860ee04da5ca41ef2e553bb8969.jpg',
    'https://i.pinimg.com/736x/7c/9f/fb/7c9ffb0837cf493548194479f2536dab.jpg',
    'https://i.pinimg.com/736x/bc/a4/41/bca441edce3ed74dd3b4928744e3a75f.jpg',
    'https://i.pinimg.com/736x/36/d1/44/36d1446f04b881423d22f119b5d418cc.jpg',
    'https://i.pinimg.com/736x/9a/1f/b1/9a1fb15bb7c718977734cb1086b5bed4.jpg',
    'https://i.pinimg.com/736x/12/45/bc/1245bca02fb8bf722fd6b9f6f541ab16.jpg',
    'https://i.pinimg.com/736x/18/05/57/18055726cb48fbf653bccbbf4207e35b.jpg',
    'https://i.pinimg.com/736x/df/29/c6/df29c6249fef6edab0b415d1cdcacb88.jpg',
    'https://i.pinimg.com/736x/2e/0d/6a/2e0d6a0138b1e0d71c49f4a7056ffe28.jpg',
    'https://i.pinimg.com/736x/9c/cf/6a/9ccf6a03ca84bf3d874bded529e66ea0.jpg',
    'https://i.pinimg.com/736x/c2/e2/29/c2e229211f205fe3b940301944ad96bb.jpg',
    'https://i.pinimg.com/736x/ee/1c/82/ee1c82e27fae09296fc3012503daeb86.jpg',
    'https://i.pinimg.com/736x/ac/c2/83/acc28307e3e289b26e2eac5510b3e6b0.jpg',
    'https://i.pinimg.com/736x/8b/01/ba/8b01ba61d8a0f64025dd1d923dc89f5e.jpg',
    'https://i.pinimg.com/736x/9c/cf/47/9ccf477cdd75cc28d72c472d66db4e36.jpg',
    'https://i.pinimg.com/736x/e9/32/5e/e9325e14771fc03b27e4621bb9a4a5f2.jpg',
    'https://i.pinimg.com/736x/d9/7f/6a/d97f6a09e73422058d1ee505c0d22826.jpg',
    'https://i.pinimg.com/736x/1c/92/7b/1c927b991ac95c56fbb38462e61ee188.jpg',
    'https://i.pinimg.com/736x/a2/5f/62/a25f62dc5b8a1e178e1cb0d956252436.jpg',
    'https://i.pinimg.com/736x/a2/3c/83/a23c83a3abf85c16ee9ce32925e5d62c.jpg',
    'https://i.pinimg.com/736x/c8/f5/4d/c8f54ddeeda191f9da3c59e46b6bc5de.jpg',
    'https://i.pinimg.com/736x/de/f3/4f/def34f44bd8f1043244ebf3be064aad7.jpg',
    'https://i.pinimg.com/736x/54/bb/09/54bb090c03ca9998d03f991cd4e9986f.jpg',
    'https://i.pinimg.com/736x/11/56/c4/1156c46251d2bafbe000660ff25a9d0d.jpg',
    'https://i.pinimg.com/736x/2b/20/54/2b205451b0b5df3f993420e799cd3d8a.jpg',
    'https://i.pinimg.com/736x/f2/85/10/f28510d6a867a6d2ddae9388bc4c2f02.jpg',
    'https://i.pinimg.com/736x/93/42/c6/9342c63c50cc63baf71932ad10026b03.jpg',
    'https://i.pinimg.com/736x/c4/55/7c/c4557c932411236bdee278bf65a359f0.jpg',
    'https://i.pinimg.com/736x/1b/6a/d0/1b6ad0c6c28643805930b01fb8461924.jpg',
    'https://i.pinimg.com/736x/57/4f/14/574f14d58e5ffbe45390edcab9986761.jpg',
    'https://i.pinimg.com/736x/0a/13/e5/0a13e512662f55653089e8dfc36f7ce3.jpg',
    'https://i.pinimg.com/736x/d7/36/b6/d736b671e7072a6474a1c0675699e7e6.jpg',
    'https://i.pinimg.com/736x/53/9a/bf/539abfdefe53bc83659904a37b428789.jpg',
    'https://i.pinimg.com/736x/80/17/db/8017db3364ff0a1b1fab2c025630f5c4.jpg',
    'https://i.pinimg.com/736x/a3/eb/1c/a3eb1c50fa96ba263e8d9f46b0a2ca52.jpg',
    'https://i.pinimg.com/736x/3b/bc/6b/3bbc6bda7b2cfae8ce07957d8b489f11.jpg',
    'https://i.pinimg.com/736x/0b/bf/0e/0bbf0e194303e85e5c3938773e858edf.jpg',
    'https://i.pinimg.com/736x/8e/61/04/8e6104dddca8de0e434cf0edf85f14c3.jpg',
    'https://i.pinimg.com/736x/43/02/68/4302685dbc3584e5e1cbf579775d0c05.jpg',
    'https://i.pinimg.com/736x/d6/85/52/d685520dca2f60d172be76b6313d6086.jpg',
    'https://i.pinimg.com/736x/38/ca/85/38ca850f34f4f7c669e4f749ad81cd65.jpg',
    'https://i.pinimg.com/736x/4b/7e/ed/4b7eed5fe3d7a373143593eca41eb2cc.jpg',
    'https://i.pinimg.com/736x/2b/e8/d7/2be8d75ebade036ac572c7a4db2689f3.jpg',
    'https://i.pinimg.com/736x/c8/00/e9/c800e952499e6c7483d581307e247486.jpg',
    'https://i.pinimg.com/736x/c5/20/01/c52001c27995a928b5c6f94bc0c0f2c2.jpg',
    'https://i.pinimg.com/736x/b5/4b/ee/b54bee48ff1e6c745b6e9fb14b566544.jpg',
    'https://i.pinimg.com/736x/66/b1/2f/66b12fb49ece5b7d14f2da064aa80121.jpg',
    'https://i.pinimg.com/736x/55/df/88/55df884614da5ca69ef824d7c5bfd2ef.jpg',
    'https://i.pinimg.com/736x/69/c1/c5/69c1c54d14e9bd086ea5d62042a7179c.jpg',
    'https://i.pinimg.com/736x/67/02/e1/6702e1bb599a5121da7955ed8a0c9f70.jpg',
    'https://i.pinimg.com/736x/ad/ca/f8/adcaf8115b235b378a23e1da8171d887.jpg',
    'https://i.pinimg.com/736x/d5/93/f9/d593f9d1db0ed5b6d31a7c3e25ef4d05.jpg',
    'https://i.pinimg.com/736x/c4/e0/be/c4e0beeb4b0faf11fd7c15c13cb99787.jpg',
    'https://i.pinimg.com/736x/c3/2a/8f/c32a8f81a91b01a96eb8bcf5bbcec636.jpg',
    'https://i.pinimg.com/736x/01/8c/ad/018cad887a771ca73c5ad76c26ad0ba2.jpg',
    'https://i.pinimg.com/736x/bc/6d/2a/bc6d2a8d1ccbb3a301a9aa671b5f5174.jpg',
    'https://i.pinimg.com/736x/fb/07/3c/fb073c52287ad0f160e6a2cffa03bef7.jpg',
    'https://i.pinimg.com/736x/30/2a/e9/302ae93059409971d2e389891b604e1f.jpg',
    'https://i.pinimg.com/736x/88/a6/3b/88a63b0ac3ed8e8521608bf7f87073a9.jpg',
    'https://i.pinimg.com/736x/56/0d/c0/560dc0efa3ad2eb278eb460036456db2.jpg',
    'https://i.pinimg.com/736x/e8/61/b4/e861b4099efe21b35ebfeaec3a4bdaa2.jpg',
    'https://i.pinimg.com/736x/fe/28/bc/fe28bc309bafd9ca89a556ee72b7acb2.jpg',
    'https://i.pinimg.com/736x/43/ad/83/43ad83740c21153a9e49a88e99fc7e11.jpg',
    'https://i.pinimg.com/736x/32/9c/d0/329cd04ee186a7a20b176a8b750e5ac8.jpg',
    'https://i.pinimg.com/736x/ec/16/02/ec1602956ca04f7626484ddb2e08a560.jpg',
    'https://i.pinimg.com/736x/27/06/bc/2706bcc2de7a036bd7d2546e1f1a0c84.jpg',
    'https://i.pinimg.com/736x/c0/d3/b8/c0d3b8eb7b05a67f5b2281847a11c1c3.jpg',
    'https://i.pinimg.com/736x/ab/19/35/ab1935cd233fd47088dd7a17b061a211.jpg',
    'https://i.pinimg.com/736x/0f/f5/72/0ff572eab5e5c28665166c79b49521dc.jpg',
    'https://i.pinimg.com/736x/f2/81/d5/f281d5d834de2532761444c799d8dba4.jpg',
    'https://i.pinimg.com/736x/3e/68/7f/3e687f7e6d1deadafd5879bce943ed6d.jpg',
    'https://i.pinimg.com/736x/79/de/f0/79def0c5af90a521c54b3daf4a42790c.jpg',
    'https://i.pinimg.com/736x/aa/43/48/aa43489f8f5278a8baa93e6c065f2a7d.jpg',
    'https://i.pinimg.com/736x/8f/12/07/8f12074361594fdd7dc4832f1398a3d4.jpg',
    'https://i.pinimg.com/736x/12/a8/46/12a84649e6c08c10e50cfe4e9bec2bdb.jpg',
    'https://i.pinimg.com/736x/be/2e/ac/be2eac703faf056c25e458f9f3d36c9b.jpg',
    'https://i.pinimg.com/736x/e2/6b/a1/e26ba10d60ff4f6f6bfa0f8eed6a489b.jpg',
    'https://i.pinimg.com/736x/89/70/69/89706991b792ad14f307d137e7fac4d1.jpg',
    'https://i.pinimg.com/736x/10/e5/56/10e55618a680cd87c60e3b1fc1975541.jpg',
    'https://i.pinimg.com/736x/ed/90/d3/ed90d341f8a92471e979b2f6508cb2b1.jpg',
    'https://i.pinimg.com/736x/90/a2/85/90a285ab9ad06820b1b5826a645f94ff.jpg',
    'https://i.pinimg.com/736x/b0/cf/3a/b0cf3a1b544359df6d917a06af66b482.jpg',
    'https://i.pinimg.com/736x/f8/64/c0/f864c0394da8618a179614b3f366b292.jpg',
    'https://i.pinimg.com/736x/15/13/41/151341694f860708882987a59a89c294.jpg',
    'https://i.pinimg.com/736x/b6/6f/98/b66f98933b4459e688d47dcb388aad10.jpg',
    'https://i.pinimg.com/736x/c8/fb/49/c8fb49979445c82810e1ad38f54a743e.jpg',
    'https://i.pinimg.com/736x/a0/15/7b/a0157b4c699c6fe2eeb57cb1b0fc85e2.jpg',
    'https://i.pinimg.com/736x/2f/e9/21/2fe921813ca4a028c222993ed84c485f.jpg',
    'https://i.pinimg.com/736x/74/58/99/745899efc16f1988b04e6860a203cb6a.jpg',
    'https://i.pinimg.com/736x/cd/1b/0e/cd1b0e30c46d469c1192a771a17e8b0a.jpg',
    'https://i.pinimg.com/736x/32/de/16/32de1697bf7e73ab00e105b8b9c487c3.jpg',
    'https://i.pinimg.com/736x/72/59/80/7259802f4bcbaf30a44ab2db4afd39cf.jpg',
    'https://i.pinimg.com/736x/c4/44/83/c44483bfcd2a48a9b4c3988e7d27e04e.jpg',
    'https://i.pinimg.com/736x/a3/54/6c/a3546c9735cf3794f25dd1ae3e61cad9.jpg',
    'https://i.pinimg.com/736x/73/a4/d9/73a4d931e5096ae01172be36e608015e.jpg',
    'https://i.pinimg.com/736x/4e/ef/9f/4eef9f25dd30aabf8da365d99e06805c.jpg',
    'https://i.pinimg.com/736x/97/10/d8/9710d85d06cd8c8ca8e05d4aa816e2ea.jpg',
    'https://i.pinimg.com/736x/5d/fc/2a/5dfc2a89e05eab53eb63439cd49c3ecf.jpg',
    'https://i.pinimg.com/736x/48/d8/de/48d8dee29964c34268f603563805589f.jpg',
    'https://i.pinimg.com/736x/02/e6/81/02e6818728fdeb57960de754d6b85ded.jpg',
    'https://i.pinimg.com/736x/56/2a/b9/562ab9dd431d14937054f3c3c7a8387b.jpg',
    'https://i.pinimg.com/736x/bf/06/85/bf068502cb108bb6336d5db04d184d3d.jpg',
    'https://i.pinimg.com/736x/5b/70/3f/5b703f7c290b86a900eb201538bcc0e9.jpg',
    'https://i.pinimg.com/736x/a9/cb/61/a9cb61ea14ade47496cdbdd474bc1df0.jpg',
    'https://i.pinimg.com/736x/11/d1/71/11d1718166d71f47e89461f4f39349ae.jpg',
    'https://i.pinimg.com/736x/bb/32/d3/bb32d3f9bafc7c758f974dbae99f75de.jpg',
    'https://i.pinimg.com/736x/38/e8/6e/38e86e324ecdd2e10b275872adcc3ae8.jpg',
    'https://i.pinimg.com/736x/3d/a3/e6/3da3e62888f95d4a4b181d1eb63af774.jpg',
    'https://i.pinimg.com/736x/ee/b0/de/eeb0decbcaa66b83a35dc730aa32c1b5.jpg',
    'https://i.pinimg.com/736x/78/af/07/78af07a6161d4e6ed47bfd05bc54723b.jpg',
    'https://i.pinimg.com/736x/1d/13/03/1d13033cc32f95b3baf29c3942aabede.jpg',
    'https://i.pinimg.com/736x/80/f7/d0/80f7d03b705ff33e3efce4ca095ed3eb.jpg',
    'https://i.pinimg.com/736x/f1/5d/47/f15d47cb6dc827cd2c3c76872027d25c.jpg',
    'https://i.pinimg.com/736x/ea/e5/8e/eae58eacfcf9ddf552150d39ac21a437.jpg',
    'https://i.pinimg.com/736x/6e/b0/fc/6eb0fc0988a3ddf1344474c9abede27e.jpg',
    'https://i.pinimg.com/736x/1f/50/4f/1f504f5cc3a4d9fc2a814cd0890f40f2.jpg',
    'https://i.pinimg.com/736x/26/cc/b8/26ccb8c9ed527b8db150bda3b1f16143.jpg',
    'https://i.pinimg.com/736x/c5/09/14/c5091428c2ae1e1b3541f71822ea2cf7.jpg',
    'https://i.pinimg.com/736x/37/f5/6d/37f56d0cdf7e1d5f2b334aabcb0a5a3e.jpg',
    'https://i.pinimg.com/736x/29/27/5f/29275f70d3ceb9d069a0b0819a1a1512.jpg',
    'https://i.pinimg.com/736x/23/19/cf/2319cf9e6011d49e398b23e7cb41d029.jpg',
    'https://i.pinimg.com/736x/34/96/e5/3496e5edd1180279e0a33007c8c311c9.jpg',
    'https://i.pinimg.com/736x/a8/1a/b5/a81ab57a683e192d06b34073354d9bd2.jpg',
    'https://i.pinimg.com/736x/08/9e/73/089e73aceb17f5f4eeb395c63be79873.jpg',
    'https://i.pinimg.com/736x/d7/bc/de/d7bcdebc5d7758631fe799c40a9dd984.jpg',
    'https://i.pinimg.com/736x/e9/30/9f/e9309ffa58b891780dad3e9248f04015.jpg',
    'https://i.pinimg.com/736x/a6/78/76/a67876ad8b96470feb0db34b9fd3d940.jpg',
    'https://i.pinimg.com/736x/ed/71/00/ed71001c909b9c4e266fdca68b89f077.jpg',
    'https://i.pinimg.com/736x/c1/83/4e/c1834efc3732f92d2fe5d45827c9fa20.jpg',
    'https://i.pinimg.com/736x/88/dc/6f/88dc6f4132c4fde8b159b6d616973273.jpg',
    'https://i.pinimg.com/736x/11/25/f9/1125f959711333f497bbc3ca5ef75494.jpg',
    'https://i.pinimg.com/736x/d5/8c/08/d58c08b4a7692aae5af4c86697cceffb.jpg',
    'https://i.pinimg.com/736x/af/45/6a/af456a11c476a4c21e48e4e0678af674.jpg',
    'https://i.pinimg.com/736x/f6/a0/98/f6a09842653e8e26d02134dd295e06d4.jpg',
    'https://i.pinimg.com/736x/6b/23/d2/6b23d2f7ffad2d879e80cad4faac9097.jpg',
    'https://i.pinimg.com/736x/64/7f/8c/647f8cfa1d95f22c850d28e7eb2168d0.jpg',
    'https://i.pinimg.com/736x/5e/4d/93/5e4d938b5875e1b592479c0aa6b7e819.jpg',
    'https://i.pinimg.com/736x/d1/ff/95/d1ff95e9f3d610668d8a339a4823a807.jpg',
    'https://i.pinimg.com/736x/36/5d/89/365d893976703cfdcf1e2f353853755d.jpg',
    'https://i.pinimg.com/736x/d0/5d/71/d05d71594b222a74bf751b4ea55b9a18.jpg',
    'https://i.pinimg.com/736x/88/29/3b/88293b2ab07bd3acaf473d537434e31e.jpg',
    'https://i.pinimg.com/736x/b8/86/08/b88608b2d7915fd219b4dd0227b0e340.jpg',
    'https://i.pinimg.com/736x/e2/ea/bc/e2eabced3036d388ce6e40610fe1e307.jpg',
    'https://i.pinimg.com/736x/4e/2e/17/4e2e171a257e7028e73e7dc8a7cf7d9b.jpg',
    'https://i.pinimg.com/736x/b3/7d/24/b37d2415c37c323607c2be4dc69af3a9.jpg',
    'https://i.pinimg.com/736x/15/de/fb/15defb48d75cc67cf46ee8d9f5d27598.jpg',
    'https://i.pinimg.com/736x/1c/4d/34/1c4d345b8f1b5fb2de5bf222787b3573.jpg',
    'https://i.pinimg.com/736x/10/a6/9e/10a69e6571c954022ce63167fdf33103.jpg',
    'https://i.pinimg.com/736x/45/11/4f/45114f61c1acad40495595accef336a6.jpg',
    'https://i.pinimg.com/736x/4a/0f/93/4a0f93ad8e5df184618ccdb3c98799e1.jpg',
    'https://i.pinimg.com/736x/e4/c9/70/e4c970c96875572c55775f9beda6982f.jpg',
    'https://i.pinimg.com/736x/e0/f2/3b/e0f23bdfe9b5d18736bc146151766aff.jpg',
    'https://i.pinimg.com/736x/fe/5b/60/fe5b60f51551fb97622c2c5ba3c810cf.jpg',
    'https://i.pinimg.com/736x/cd/b5/79/cdb579cdd15aca3d0950e730a20a0c0c.jpg',
  ],
  crystal: [
    'https://i.pinimg.com/736x/ee/e0/2d/eee02da368f5e474b6d7879c3572e06d.jpg',
    'https://i.pinimg.com/736x/99/0f/84/990f8450b2560362c51f448a50bd37cb.jpg',
    'https://i.pinimg.com/736x/db/95/3d/db953dd83bddd894b6ade214c7bc9b3d.jpg',
    'https://i.pinimg.com/736x/ac/06/bf/ac06bf78d27499f41e599c4fa65c4693.jpg',
    'https://i.pinimg.com/736x/e6/52/3c/e6523cf19e61bdf126df8b32cefb2ef9.jpg',
    'https://i.pinimg.com/736x/dd/8e/87/dd8e877b5df143639f2262734d3fdcec.jpg',
    'https://i.pinimg.com/736x/3e/96/ac/3e96ac8f4dbf31fc684670bac5254a90.jpg',
    'https://i.pinimg.com/736x/97/cd/0c/97cd0c451715baaf70d78790396487a5.jpg',
    'https://i.pinimg.com/736x/b9/5b/f7/b95bf7367b43345012259cb226942780.jpg',
    'https://i.pinimg.com/736x/9b/ca/20/9bca20d41370690596f109c9e6c8ba69.jpg',
    'https://i.pinimg.com/736x/f7/c2/76/f7c27666240de918320294096aa60317.jpg',
    'https://i.pinimg.com/736x/06/b7/e2/06b7e223da5b253f30de55dac4c53edc.jpg',
    'https://i.pinimg.com/736x/3e/5f/09/3e5f096a67b713f4e6446ab6921e4e8c.jpg',
    'https://i.pinimg.com/736x/07/fd/81/07fd81c20d9d719e613ed93059ddabe2.jpg',
    'https://i.pinimg.com/736x/01/89/a3/0189a3aaf70073c77df3c4c2d2521568.jpg',
    'https://i.pinimg.com/736x/d6/f6/10/d6f610f1f2d8f0e6798ec0f528f811da.jpg',
    'https://i.pinimg.com/736x/54/de/ae/54deae02d0a6956a56073e3e60c72dea.jpg',
    'https://i.pinimg.com/736x/ec/3e/03/ec3e0349cd7d04f7c9e73b2e7807243b.jpg',
    'https://i.pinimg.com/736x/c8/33/ed/c833edb4015e584c363ca1438019c9b1.jpg',
    'https://i.pinimg.com/736x/c0/68/ae/c068ae7c8e5f257c970624658c62d6a9.jpg',
    'https://i.pinimg.com/736x/12/16/d5/1216d55b9282070625b650945c0c85fe.jpg',
    'https://i.pinimg.com/736x/08/40/7d/08407d5270b57009b231436a0b6e468a.jpg',
    'https://i.pinimg.com/736x/ee/b4/81/eeb481180f0d698f7652c8630a356a11.jpg',
    'https://i.pinimg.com/736x/da/8f/01/da8f01aa38f0fd1373d46847dda7ae70.jpg',
    'https://i.pinimg.com/736x/a8/69/e4/a869e4fbf2ac60001988a6add0a58e6b.jpg',
    'https://i.pinimg.com/736x/16/af/72/16af729dcb6d38a3f2883e95c97a517a.jpg',
    'https://i.pinimg.com/736x/c5/6b/45/c56b453e90adb9d8f81b9684357588b2.jpg',
    'https://i.pinimg.com/736x/9e/0c/88/9e0c88949e443f4339d892069043ba4d.jpg',
    'https://i.pinimg.com/736x/72/bc/43/72bc437b6be9e9aab4eff3a3d024e288.jpg',
    'https://i.pinimg.com/736x/a4/38/6b/a4386b11e15e5e61428cedad528db772.jpg',
    'https://i.pinimg.com/736x/02/48/64/024864adba4b0468a742efaa531e7e60.jpg',
    'https://i.pinimg.com/736x/88/dc/57/88dc5720fda547e8eb6d77c4daa77426.jpg',
    'https://i.pinimg.com/736x/11/fa/09/11fa09f78ca8ed5346fa49686316258a.jpg',
    'https://i.pinimg.com/736x/09/c9/3a/09c93a71c313a7a635f144dd7077eae4.jpg',
    'https://i.pinimg.com/736x/05/f5/e1/05f5e184116cdad148ac65fe7e0e3472.jpg',
    'https://i.pinimg.com/736x/8d/44/31/8d4431e48d8ac72c56ebce7601be4a62.jpg',
    'https://i.pinimg.com/736x/34/e6/0a/34e60acad12a1286397073f01ccabf00.jpg',
    'https://i.pinimg.com/736x/67/15/b8/6715b8469838c44f5173e239b9b2196e.jpg',
    'https://i.pinimg.com/736x/20/b1/31/20b1318b6788df5bcad4e486a49b2056.jpg',
    'https://i.pinimg.com/736x/a2/8f/b6/a28fb6f31584f17f08cf4b31b7b925dc.jpg',
    'https://i.pinimg.com/736x/84/22/3e/84223e250ecb2ed9601d497204f4291b.jpg',
    'https://i.pinimg.com/736x/44/08/6a/44086a22354ca103d821b19da6d1e2a1.jpg',
    'https://i.pinimg.com/736x/0c/21/8f/0c218fe6de979bf8493542e93a93a7c6.jpg',
    'https://i.pinimg.com/736x/0c/f2/84/0cf284ec0bd3d3866766146be16b4c76.jpg',
    'https://i.pinimg.com/736x/f4/94/93/f494936346c7b951ea7f21c246fd499c.jpg',
    'https://i.pinimg.com/736x/48/10/aa/4810aaebebaffc196f93773850761126.jpg',
    'https://i.pinimg.com/736x/f3/70/96/f3709616d059dd7c2637fa2363b30234.jpg',
    'https://i.pinimg.com/736x/12/7f/57/127f57bb37cfbdb3b4dfaeea0c7b4cf4.jpg',
    'https://i.pinimg.com/736x/7a/e7/de/7ae7ded14bab97ace8ac7f3a08d48a6d.jpg',
    'https://i.pinimg.com/736x/33/1e/aa/331eaaeaf0345d3aeb364b8035338760.jpg',
    'https://i.pinimg.com/736x/2c/4e/7a/2c4e7abebc9ff40d0e0e52faa4a59065.jpg',
    'https://i.pinimg.com/736x/73/79/02/737902f17a1029ccad3372b3e4290cf1.jpg',
    'https://i.pinimg.com/736x/9b/da/7f/9bda7fe7815ed9560d9af634949c59aa.jpg',
    'https://i.pinimg.com/736x/9f/b0/7b/9fb07b6e88ba5a6aab515509a4cd860b.jpg',
    'https://i.pinimg.com/736x/ca/48/e5/ca48e510a3274348f82f4643182a18b0.jpg',
    'https://i.pinimg.com/736x/21/68/31/216831091c1d4857f03240f8b2575d6f.jpg',
    'https://i.pinimg.com/736x/c0/e1/72/c0e172cabc4c4b3783162658e70390cb.jpg',
    'https://i.pinimg.com/736x/e7/83/d0/e783d0f6e326a76535f19600da79819f.jpg',
    'https://i.pinimg.com/736x/f0/4c/3b/f04c3b343ed6d59779cf2b9a21d62962.jpg',
    'https://i.pinimg.com/736x/d9/10/55/d91055fe9a7df5f2a974402a7f69aec9.jpg',
    'https://i.pinimg.com/736x/23/00/9c/23009cb6df1b2b440dcc231147638dd8.jpg',
    'https://i.pinimg.com/736x/89/56/95/895695deaca3d21109e7c6e3a7625515.jpg',
    'https://i.pinimg.com/736x/ad/bb/74/adbb74ac397f6a74b36f6c46691c9cb2.jpg',
    'https://i.pinimg.com/736x/51/87/85/518785edfd3a17c8fa8295a41f92648e.jpg',
    'https://i.pinimg.com/736x/6e/1f/8b/6e1f8bea685837fef5ac30970a0ca3fe.jpg',
    'https://i.pinimg.com/736x/4e/9f/25/4e9f2519c8e24a31c08c7cab1a406424.jpg',
    'https://i.pinimg.com/736x/67/9a/f8/679af864ab64275a0babb602402d21b7.jpg',
    'https://i.pinimg.com/736x/98/8f/b4/988fb4263dd9a729bc56e63822c5903d.jpg',
    'https://i.pinimg.com/736x/93/80/ea/9380eaaef2d95b67a1b3cc6afdbad303.jpg',
    'https://i.pinimg.com/736x/ab/92/2f/ab922fa8751049222879c80b80b51cca.jpg',
    'https://i.pinimg.com/736x/c5/84/92/c58492df295d2673d12c0204032ee096.jpg',
    'https://i.pinimg.com/736x/ab/d2/31/abd231b09f4666df853ff4b0cabf01ec.jpg',
    'https://i.pinimg.com/736x/64/74/51/647451e934f72bb1868a766744a57b01.jpg',
    'https://i.pinimg.com/736x/97/b5/a8/97b5a8e2cecb332c24073a5ccd03981f.jpg',
    'https://i.pinimg.com/736x/a8/63/b5/a863b5cc1c60876bd6762869e6c1730c.jpg',
    'https://i.pinimg.com/736x/c4/89/88/c48988c2e469ed68d2158a3ee42b9e3a.jpg',
    'https://i.pinimg.com/736x/1e/7f/06/1e7f062e8acb8cfa72cf25bbc783e010.jpg',
    'https://i.pinimg.com/736x/da/b3/89/dab3890726b7781faf0f6256e64045ee.jpg',
    'https://i.pinimg.com/736x/84/e0/a8/84e0a80c27b4c106efddc4704ff994cf.jpg',
    'https://i.pinimg.com/736x/76/05/f4/7605f41e848e85d9fc9c2b685e72322b.jpg',
    'https://i.pinimg.com/736x/26/8a/df/268adf80641fa4396ce233a8d694b998.jpg',
    'https://i.pinimg.com/736x/42/8e/a5/428ea5892240e6f871b738bcc519d5c6.jpg',
    'https://i.pinimg.com/736x/a0/c1/cc/a0c1cc72b8ad7b47de6cc22e3f1b3a92.jpg',
    'https://i.pinimg.com/736x/0f/2f/73/0f2f736d097c42beefe9bd1f8efdea79.jpg',
    'https://i.pinimg.com/736x/43/b4/0a/43b40aca6cba888daa80c3a3a63b0c78.jpg',
    'https://i.pinimg.com/736x/f1/58/aa/f158aa614f6d3026480aa661f7ea9ab3.jpg',
    'https://i.pinimg.com/736x/0a/dd/1b/0add1bb90c7151e316ddc9e070173f53.jpg',
    'https://i.pinimg.com/736x/58/a4/b0/58a4b0da1b6cabffb07acbe86367261f.jpg',
    'https://i.pinimg.com/736x/00/9f/01/009f010ab9f2fa212d68c2e0278809d6.jpg',
    'https://i.pinimg.com/736x/b9/8e/5e/b98e5e8c40ec650b67504dcb17868c82.jpg',
    'https://i.pinimg.com/736x/e6/e7/e9/e6e7e99c05d6aaffe325211df0b74561.jpg',
    'https://i.pinimg.com/736x/11/f4/6d/11f46dd9279b557aa8c8312ee6eb6136.jpg',
    'https://i.pinimg.com/736x/85/4c/94/854c946533de3d4c1beb823c51e21d2b.jpg',
    'https://i.pinimg.com/736x/96/d8/20/96d820c4a5b9e3eee65f33e5053cd4b7.jpg',
    'https://i.pinimg.com/736x/6d/2c/19/6d2c198bc92998f37692c32a030535ff.jpg',
    'https://i.pinimg.com/736x/68/5e/fd/685efd913e4f439673cb716fb6e49791.jpg',
    'https://i.pinimg.com/736x/ea/95/ff/ea95ff5c47408bf485d59716692554ba.jpg',
    'https://i.pinimg.com/736x/ab/1c/9b/ab1c9bb5944fdc6514296c9f385ffe7a.jpg',
    'https://i.pinimg.com/736x/9b/75/68/9b7568081619ba60cee70e2e34689f89.jpg',
    'https://i.pinimg.com/736x/98/cd/12/98cd12b26f96c45666af2366fcc4bf7f.jpg',
    'https://i.pinimg.com/736x/33/b3/4f/33b34f62691d05d12452bc462f75307d.jpg',
    'https://i.pinimg.com/736x/ae/f1/e9/aef1e9ce77f9f44a3fd7153e7fcd67e2.jpg',
    'https://i.pinimg.com/736x/8b/4b/1d/8b4b1dface5459aac2270b5f8ea0cba5.jpg',
    'https://i.pinimg.com/736x/2b/c6/c4/2bc6c4cc67b89e163d29f83011d4651a.jpg',
    'https://i.pinimg.com/736x/30/6d/00/306d002e6f0878397b321cc99dafde3f.jpg',
    'https://i.pinimg.com/736x/5a/33/73/5a3373c557c57fe3ca4d1ce6b8df1924.jpg',
    'https://i.pinimg.com/736x/7e/6d/06/7e6d068132c6eb82eaa02607b88e6185.jpg',
    'https://i.pinimg.com/736x/6c/e0/aa/6ce0aa906590d108f22dbae148d7a278.jpg',
    'https://i.pinimg.com/736x/91/38/b8/9138b8223064fa072279792de9e20f83.jpg',
    'https://i.pinimg.com/736x/65/ca/7d/65ca7daa1c3b926163b2d085a0aa6ab1.jpg',
    'https://i.pinimg.com/736x/20/96/e3/2096e328872935d228bba0e1b92f8f89.jpg',
    'https://i.pinimg.com/736x/0a/c6/d6/0ac6d6a2ee551a19b0cead72f9608cf2.jpg',
    'https://i.pinimg.com/736x/e7/fc/b8/e7fcb81709e80051daea3391a220aae3.jpg',
    'https://i.pinimg.com/736x/ea/65/4c/ea654c35369ea838c81c7779b0fb1b14.jpg',
    'https://i.pinimg.com/736x/8b/36/3c/8b363cacd3e40a0c06caf9851cc21120.jpg',
    'https://i.pinimg.com/736x/8d/2d/e6/8d2de63763060fc4d2f9ca33ecd9022b.jpg',
    'https://i.pinimg.com/736x/7d/43/a7/7d43a776e29a48ca7d2b0e2ed2a8beb1.jpg',
    'https://i.pinimg.com/736x/41/e1/c6/41e1c6ac808d2d298c11c1247ea3e91f.jpg',
    'https://i.pinimg.com/736x/2c/44/94/2c44945c631e9171bd474b5c5ffa8e7d.jpg',
    'https://i.pinimg.com/736x/7c/29/df/7c29df49e94bbda6b6ecb199fc0f7958.jpg',
    'https://i.pinimg.com/736x/3c/ca/79/3cca79bd64a876e249048bac9ec4733c.jpg',
    'https://i.pinimg.com/736x/f3/31/09/f3310934304db115dbf26811aad0c2c3.jpg',
    'https://i.pinimg.com/736x/e7/3f/38/e73f388970b5be51e6eb5ebcb49fda3a.jpg',
    'https://i.pinimg.com/736x/d1/69/81/d16981f74893ca45752fb47ff72c0b7b.jpg',
    'https://i.pinimg.com/736x/2b/50/04/2b5004a3af9c2c21c74d3ff24e52b9ef.jpg',
    'https://i.pinimg.com/736x/b6/4b/32/b64b32076ea78f695175e665570388ba.jpg',
    'https://i.pinimg.com/736x/84/57/dc/8457dcd33b4e191f8afc4b47b0f9224a.jpg',
    'https://i.pinimg.com/736x/24/e2/bf/24e2bf524d89318d7ff6833ee5d5f768.jpg',
    'https://i.pinimg.com/736x/aa/73/11/aa73112b2ebb9261bde390b79ea85426.jpg',
    'https://i.pinimg.com/736x/51/50/62/5150621bbb16d3a4b669aaf7c04a9c9e.jpg',
    'https://i.pinimg.com/736x/49/bb/69/49bb694c11faedc5629181dfd3269973.jpg',
    'https://i.pinimg.com/736x/bf/bd/10/bfbd10d8c845109d42fce9d9463a0bd5.jpg',
    'https://i.pinimg.com/736x/e3/f6/79/e3f679eac81d8ed4097831c781fb89e7.jpg',
    'https://i.pinimg.com/736x/10/41/37/104137bc92342c30fbc23997724c919a.jpg',
    'https://i.pinimg.com/736x/e2/59/17/e259171db7f034f8c3ffc54d6434346a.jpg',
    'https://i.pinimg.com/736x/cd/bf/12/cdbf12ded1a7458401a0321aba02f932.jpg',
    'https://i.pinimg.com/736x/d5/bc/31/d5bc31e4aafa866d8a5315aabebe6314.jpg',
    'https://i.pinimg.com/736x/75/5b/74/755b74e43e23c03ba1d308f3114d91e3.jpg',
    'https://i.pinimg.com/736x/f7/c9/dd/f7c9ddf1274830cfc576d265f8373576.jpg',
    'https://i.pinimg.com/736x/38/d6/e0/38d6e0e257a8e7ec2a97b6abdc3c0d21.jpg',
    'https://i.pinimg.com/736x/12/9c/c5/129cc545b9e075d364396c0bf4138226.jpg',
    'https://i.pinimg.com/736x/d9/14/b9/d914b99ee0b05a1b8767088df2107009.jpg',
    'https://i.pinimg.com/736x/40/23/d8/4023d89d8c4713de5382853aa61e7a5d.jpg',
    'https://i.pinimg.com/736x/d3/0a/f6/d30af674445d7eebb4e766263b31a160.jpg',
    'https://i.pinimg.com/736x/49/fe/21/49fe2118a90bf544c25ff86c02c8a471.jpg',
    'https://i.pinimg.com/736x/20/72/70/2072704de93cd057daa591a54e3c6e86.jpg',
    'https://i.pinimg.com/736x/26/3d/27/263d273941d7add9983f51ff4f4025c0.jpg',
    'https://i.pinimg.com/736x/52/31/1c/52311c1969bc60128340b055db594661.jpg',
    'https://i.pinimg.com/736x/b2/1e/e5/b21ee5635f2605f89ab8c05940280620.jpg',
    'https://i.pinimg.com/736x/04/a9/99/04a999f873b50a72b79b509d4f53fd39.jpg',
    'https://i.pinimg.com/736x/0b/0b/51/0b0b51394c64f37802e0fdc0f107f75c.jpg',
    'https://i.pinimg.com/736x/82/88/e7/8288e7ecaeefed479561b9ecbb684432.jpg',
    'https://i.pinimg.com/736x/fc/1e/66/fc1e666ee19b97959cc58d18f3beb129.jpg',
    'https://i.pinimg.com/736x/fd/c0/ea/fdc0eabf46d7a3931ad415f913ff57c2.jpg',
    'https://i.pinimg.com/736x/04/ac/45/04ac45f204db27af12fdd77288cd76dc.jpg',
    'https://i.pinimg.com/736x/c4/7d/cf/c47dcfab272532278b3324beb66e8253.jpg',
    'https://i.pinimg.com/736x/e7/55/3d/e7553d52786a6598fd6bf86bc1bc2890.jpg',
    'https://i.pinimg.com/736x/d4/ae/48/d4ae4889d8b6efa39db9db080f4c81d3.jpg',
    'https://i.pinimg.com/736x/57/ed/7b/57ed7b9a0a63583f76a98998e3500ed9.jpg',
    'https://i.pinimg.com/736x/b3/4e/9e/b34e9eb6a4e5ebf5fdffe743081c8528.jpg',
    'https://i.pinimg.com/736x/4d/e7/d2/4de7d23330c761a7460e6fbfa4d15def.jpg',
    'https://i.pinimg.com/736x/83/2d/68/832d680c54089043ee64d8c98b17414a.jpg',
  ],
  loa: [
    'https://i.pinimg.com/736x/06/4c/81/064c81088a92ac19852c827812a6cbbc.jpg',
    'https://i.pinimg.com/736x/9c/df/e3/9cdfe3e2069a2d9fef6e467487749e0e.jpg',
    'https://i.pinimg.com/736x/be/5b/1b/be5b1b5334cd81bae4b51f108449eb05.jpg',
    'https://i.pinimg.com/736x/ae/e9/38/aee938db6452d61cec202ae1f1c77357.jpg',
    'https://i.pinimg.com/736x/51/0b/8f/510b8f390e0248edea627f7a51c340d6.jpg',
    'https://i.pinimg.com/736x/d1/77/ed/d177ed54b71575410461e5252d730000.jpg',
    'https://i.pinimg.com/736x/2f/15/ac/2f15ac70e97ccf864fc3884226406519.jpg',
    'https://i.pinimg.com/736x/4e/85/8f/4e858fd0c3eef8282b48ad980355919f.jpg',
    'https://i.pinimg.com/736x/db/0f/3f/db0f3f92e2bcc908f0c798bd674e36d1.jpg',
    'https://i.pinimg.com/736x/f2/98/53/f29853d69622e0d06eaefabc66bf51ae.jpg',
    'https://i.pinimg.com/736x/f5/04/a7/f504a7f017915d0a815154748ab0f0ae.jpg',
    'https://i.pinimg.com/736x/eb/17/82/eb1782f05601264f35f400d129799bd8.jpg',
    'https://i.pinimg.com/736x/a2/41/86/a24186a0cd514c6f581d15e35a51d5b7.jpg',
    'https://i.pinimg.com/736x/5f/32/c4/5f32c449c5d417383d6b1ff62cb2d26c.jpg',
    'https://i.pinimg.com/736x/53/a4/7f/53a47f3544837639be61351d5b95dc58.jpg',
    'https://i.pinimg.com/736x/06/5a/73/065a737f64adadc1e7a7164e7a8a17e0.jpg',
    'https://i.pinimg.com/736x/1f/86/5f/1f865fef7e8bce3392432df4ea047035.jpg',
    'https://i.pinimg.com/736x/b2/8d/99/b28d995d1ca5a77932896ee13dae8dfd.jpg',
    'https://i.pinimg.com/736x/c9/16/cb/c916cbb76458b2a44b8e072dbf9df523.jpg',
    'https://i.pinimg.com/736x/82/7c/69/827c69ab1bf692d214cc723e2ee94ec4.jpg',
    'https://i.pinimg.com/736x/88/19/28/881928f52627ed2932638ba10548fb60.jpg',
    'https://i.pinimg.com/736x/11/1e/a0/111ea0b456e2de81b964b1f984a15f76.jpg',
    'https://i.pinimg.com/736x/a8/10/af/a810af2cd9e96bf1d7dcfa597b5900e5.jpg',
    'https://i.pinimg.com/736x/b0/44/c9/b044c9ff35c0db00d43434fb7e619f76.jpg',
    'https://i.pinimg.com/736x/1c/ec/42/1cec42ae1c5ea98cffceb17147d2ee58.jpg',
    'https://i.pinimg.com/736x/f3/d3/46/f3d346a72cb8cf4ee981f0cc0197d142.jpg',
    'https://i.pinimg.com/736x/5c/04/9e/5c049e6f61e1f2de68872893befcd66e.jpg',
    'https://i.pinimg.com/736x/ee/bb/77/eebb77bd0382bd882523cdaed5e59aa3.jpg',
    'https://i.pinimg.com/736x/e0/ea/2c/e0ea2c25d445cf0ff3a1d62b05349f0e.jpg',
    'https://i.pinimg.com/736x/c8/35/8c/c8358c04a1855ef62398c1d8da016c29.jpg',
    'https://i.pinimg.com/736x/0b/b2/9b/0bb29bb74795042db10a0dc121da928b.jpg',
    'https://i.pinimg.com/736x/ed/b5/f6/edb5f63196daae5e9441ad17ccda088f.jpg',
    'https://i.pinimg.com/736x/3a/8d/ec/3a8dece43199223005c6d7135aeb3416.jpg',
    'https://i.pinimg.com/736x/72/d4/5f/72d45f28a9a434e8850d43d100090ce4.jpg',
    'https://i.pinimg.com/736x/c7/90/2a/c7902a0810017ecd1d0a578d9a8b3613.jpg',
    'https://i.pinimg.com/736x/80/19/99/8019993d3afe286848c6bb3cb0519918.jpg',
    'https://i.pinimg.com/736x/ce/17/51/ce1751d953e230ceca0bb29a66122fc4.jpg',
    'https://i.pinimg.com/736x/8a/91/a1/8a91a1f55004cb6dd1dc4cbc5ef53904.jpg',
    'https://i.pinimg.com/736x/f1/14/de/f114de7b8a43a6e981b9ea8f60785475.jpg',
    'https://i.pinimg.com/736x/c5/8c/08/c58c084e574b9870d6a1f1ce273b7896.jpg',
    'https://i.pinimg.com/736x/d8/20/fa/d820fac39c679e30e8d703aff7e98f02.jpg',
    'https://i.pinimg.com/736x/04/4b/18/044b187bb2ed13d2a236ff4dc17fa5c2.jpg',
    'https://i.pinimg.com/736x/c6/43/48/c64348cb517bfb520fc1c29ee2d8ff65.jpg',
    'https://i.pinimg.com/736x/34/64/74/3464743363bc7a898d3f6ad1c8def8e0.jpg',
    'https://i.pinimg.com/736x/98/f7/31/98f731f2e38bd9fc29ee03e77cde9fab.jpg',
    'https://i.pinimg.com/736x/d2/6e/10/d26e10df1bb108173dff9712d4e4761b.jpg',
    'https://i.pinimg.com/736x/3e/5f/ac/3e5facdc2002002f02e222ae43adb927.jpg',
    'https://i.pinimg.com/736x/58/9a/4c/589a4cdbb8d422b494b143d63f67d40a.jpg',
    'https://i.pinimg.com/736x/a4/43/c2/a443c23e8ade7f87925ff62d363963b1.jpg',
    'https://i.pinimg.com/736x/43/98/3d/43983d4ef71f0ee80e5fcaaf37e8c3a3.jpg',
    'https://i.pinimg.com/736x/40/8c/13/408c13788eaace7a40ed7f4a3c999717.jpg',
    'https://i.pinimg.com/736x/c2/a3/ec/c2a3ec96c3cb310c3d17507128c81b63.jpg',
    'https://i.pinimg.com/736x/38/a0/22/38a0226840c0f87bf3db58e8524ff5a7.jpg',
    'https://i.pinimg.com/736x/99/88/3d/99883d8da1d46c96ec13e4cd46d384ac.jpg',
    'https://i.pinimg.com/736x/87/be/5e/87be5e88f32bd8e728b327e4039f0009.jpg',
    'https://i.pinimg.com/736x/2d/5a/de/2d5adeeb0b0c358f1899a6d58b318868.jpg',
    'https://i.pinimg.com/736x/ef/3f/4f/ef3f4fb1dbc178cb9b6a3c7c5e274064.jpg',
    'https://i.pinimg.com/736x/b8/43/cd/b843cd11a3508a8e4b95e35535d31ecb.jpg',
    'https://i.pinimg.com/736x/1c/78/19/1c781920f33744ef87adb89c66dc52fe.jpg',
    'https://i.pinimg.com/736x/be/60/f3/be60f31544a3f6fda6ad1b41fb52208f.jpg',
    'https://i.pinimg.com/736x/1b/77/d0/1b77d04ede961bfcdf9ebb57f9986b0b.jpg',
    'https://i.pinimg.com/736x/18/e9/54/18e9543ba58cc20aef145c67ed50c45c.jpg',
    'https://i.pinimg.com/736x/22/f7/88/22f7888e1860bad550cd93e9b926e0c7.jpg',
    'https://i.pinimg.com/736x/d3/b7/6b/d3b76b095d9d485c7ce3b59100a1dd6a.jpg',
    'https://i.pinimg.com/736x/cf/16/19/cf1619bae2913fa8d9421e272e3667c8.jpg',
    'https://i.pinimg.com/736x/3e/eb/0a/3eeb0aa1feb6b794de6a9497433e85bf.jpg',
    'https://i.pinimg.com/736x/24/80/e2/2480e24c687cfe436d3a16ccfe0fe757.jpg',
    'https://i.pinimg.com/736x/93/de/80/93de80d9ca910ae0c96188dadb6926b6.jpg',
    'https://i.pinimg.com/736x/e7/85/80/e7858025b8f982cbf616cecee16c809e.jpg',
    'https://i.pinimg.com/736x/4f/77/ad/4f77ad1c094562bf8cfbeffb3073ee4d.jpg',
    'https://i.pinimg.com/736x/ae/c2/8c/aec28c636d783d8e803aa366d508fecc.jpg',
    'https://i.pinimg.com/736x/08/87/81/0887814245a1fbf0a6168e6ae56ccce6.jpg',
    'https://i.pinimg.com/736x/52/6a/c8/526ac8f4b9cf687d273374b1d5b44aad.jpg',
    'https://i.pinimg.com/736x/34/aa/36/34aa3622055293d01013912ee7cb2f90.jpg',
    'https://i.pinimg.com/736x/d9/9d/dd/d99dddbaaeddb0e43e06bc8638d5fb20.jpg',
    'https://i.pinimg.com/736x/e7/4d/92/e74d92db022d1ed8c8b451cd0b9f0282.jpg',
    'https://i.pinimg.com/736x/9d/b5/87/9db587661615d063a02331e053e33060.jpg',
    'https://i.pinimg.com/736x/53/70/99/5370996e54f4cae169f7f59d78347cfb.jpg',
    'https://i.pinimg.com/736x/d8/45/1e/d8451e5950e29c73d644af047ab0ffe9.jpg',
    'https://i.pinimg.com/736x/fc/40/59/fc4059f52e746c4af457720c95cb06b0.jpg',
    'https://i.pinimg.com/736x/cf/5f/fc/cf5ffccf0e6482008f952cbcf4e35e88.jpg',
    'https://i.pinimg.com/736x/ec/a2/6f/eca26fc22972ed8f4ab5856ab5cda63d.jpg',
    'https://i.pinimg.com/736x/d0/29/fd/d029fd9f8b168058c5c3ba09a11f3200.jpg',
    'https://i.pinimg.com/736x/a1/44/56/a144565e85ae3824c75aa3dd7bde2d5b.jpg',
    'https://i.pinimg.com/736x/02/0d/76/020d7638a24a86ac27496da9d1d0d63e.jpg',
    'https://i.pinimg.com/736x/f6/a3/25/f6a325f2d3a7a8599b59d31633b6bcd4.jpg',
    'https://i.pinimg.com/736x/90/d4/01/90d401445bccdcd6815dde2f56e26265.jpg',
    'https://i.pinimg.com/736x/c8/84/27/c88427f93031f1b32cf4f89e8569da94.jpg',
    'https://i.pinimg.com/736x/b8/48/a1/b848a14390eee06c45486e8a1c37413d.jpg',
    'https://i.pinimg.com/736x/5f/d5/2d/5fd52db0dd4e942ae092a13f7bf6fe0d.jpg',
    'https://i.pinimg.com/736x/67/e2/00/67e20078d9dc3599086e6bf17f99d501.jpg',
    'https://i.pinimg.com/736x/66/03/ea/6603eaaf070361e8d6524b69099a1e1a.jpg',
    'https://i.pinimg.com/736x/ce/26/45/ce2645c5753a4572861f2846c9e6922e.jpg',
    'https://i.pinimg.com/736x/20/c1/04/20c104b0419958be9cc6843144d11e9f.jpg',
    'https://i.pinimg.com/736x/d2/5c/c4/d25cc483a19e9cbf57883bf6c16b9639.jpg',
    'https://i.pinimg.com/736x/a9/80/f7/a980f74f07c7f476292e60ad0a3779f7.jpg',
    'https://i.pinimg.com/736x/e3/1c/89/e31c899f12c33aabcbaf8ce445f2362c.jpg',
    'https://i.pinimg.com/736x/e0/a4/6b/e0a46bd0854e242e491a7b05b28aadef.jpg',
    'https://i.pinimg.com/736x/03/f1/9a/03f19ae384639e332b7885345ee669a2.jpg',
    'https://i.pinimg.com/736x/98/42/82/9842824e4acf6a326aa9a44be9814e0e.jpg',
    'https://i.pinimg.com/736x/c8/64/5d/c8645db0e31dfdac76cfd22f7d259ed1.jpg',
    'https://i.pinimg.com/736x/2f/5c/07/2f5c076dccf3c71b6123e405949de8ee.jpg',
    'https://i.pinimg.com/736x/7b/12/9f/7b129ff29ee8c4d2ef3e45df00dd89e1.jpg',
    'https://i.pinimg.com/736x/d3/06/c1/d306c11fe1a1a7ac6a78d02391978b0d.jpg',
    'https://i.pinimg.com/736x/65/e8/1a/65e81a248006303b97b2d54b37efc760.jpg',
    'https://i.pinimg.com/736x/7f/20/c4/7f20c475c0f045c8161b3de5e5ee3848.jpg',
    'https://i.pinimg.com/736x/df/84/34/df843436768637254521e8d684e4e6f3.jpg',
    'https://i.pinimg.com/736x/91/39/42/913942ab61a236710993f0e177466935.jpg',
    'https://i.pinimg.com/736x/09/b1/a2/09b1a2ca8263e122b15a37b8911423e4.jpg',
    'https://i.pinimg.com/736x/81/20/bb/8120bb9f9519189bdbb78799ab48efc6.jpg',
    'https://i.pinimg.com/736x/83/ed/5d/83ed5df7e5bd0be5e01ef828b6199e5d.jpg',
    'https://i.pinimg.com/736x/89/51/67/895167e758a781b630ac4a569179910e.jpg',
    'https://i.pinimg.com/736x/01/b3/82/01b3822d0727ac3534034c346ee02217.jpg',
    'https://i.pinimg.com/736x/f2/75/19/f27519cc07d2779778a9fdd782512d79.jpg',
    'https://i.pinimg.com/736x/c4/7c/e8/c47ce850d4a6813a1b2565fabef3e5c8.jpg',
    'https://i.pinimg.com/736x/af/df/7b/afdf7b9064dc1e9332f2bf2c377cb22e.jpg',
    'https://i.pinimg.com/736x/64/dc/13/64dc13cf5e66d175c9ac5c385b594b1e.jpg',
    'https://i.pinimg.com/736x/e9/41/68/e94168f1dd2ec4ad0719540de4fc165b.jpg',
    'https://i.pinimg.com/736x/37/3c/06/373c0670e97b615521a9376694f032cc.jpg',
    'https://i.pinimg.com/736x/08/f5/db/08f5db9b5bae49afca5f2c3151529580.jpg',
    'https://i.pinimg.com/736x/30/69/d3/3069d3336030c5852b317c546557954d.jpg',
    'https://i.pinimg.com/736x/38/25/af/3825afbe98634b77e6af403a338e003e.jpg',
    'https://i.pinimg.com/736x/15/7f/df/157fdfd7af0dadf97333f1a58b9d0bbd.jpg',
    'https://i.pinimg.com/736x/74/af/f6/74aff6e836987c5d07893d73e7063be2.jpg',
    'https://i.pinimg.com/736x/73/27/f6/7327f6d359f189a3b5c760f1d5a604c6.jpg',
    'https://i.pinimg.com/736x/6b/81/ec/6b81ecd3929e198ac279526ab66236fc.jpg',
    'https://i.pinimg.com/736x/b2/14/ed/b214ed6218870e4ee36bd9f22932d44c.jpg',
    'https://i.pinimg.com/736x/8c/2a/34/8c2a342eb3e5affeab2f4cb76d79cc12.jpg',
    'https://i.pinimg.com/736x/10/39/1d/10391d15e43bcdfa23b11bda7355ff19.jpg',
    'https://i.pinimg.com/736x/87/8c/10/878c104905d1fe236f830667dc14c29f.jpg',
    'https://i.pinimg.com/736x/b5/18/a9/b518a9cad3d589bf61f571b278045736.jpg',
    'https://i.pinimg.com/736x/3b/d7/fa/3bd7fa8724c49952fa92d985d2e63045.jpg',
    'https://i.pinimg.com/736x/98/e1/c5/98e1c509bd5014c9080202e680deeb2a.jpg',
    'https://i.pinimg.com/736x/27/5b/d0/275bd0805153d715c41d6791cbb67d88.jpg',
    'https://i.pinimg.com/736x/64/fa/69/64fa6916813ef771d0105568b8e11ef3.jpg',
    'https://i.pinimg.com/736x/73/82/32/73823218590ec1786d0ac54b8772cab0.jpg',
    'https://i.pinimg.com/736x/ad/e1/71/ade17158d4fbb45eea6d4723eb69e42e.jpg',
    'https://i.pinimg.com/736x/d6/06/74/d606742a8fc5712c7d9fccb77c37d2c3.jpg',
    'https://i.pinimg.com/736x/89/8d/91/898d91cb4a62cb9235ee9a641e968feb.jpg',
    'https://i.pinimg.com/736x/69/0b/e5/690be5ad9f2a9e64b9a31b0ee1c7d95c.jpg',
    'https://i.pinimg.com/736x/ba/ab/17/baab177e3738173cfe817695a10a94b9.jpg',
    'https://i.pinimg.com/736x/9b/b0/57/9bb0573578115fc6b9bfb8f6f0d2d2be.jpg',
    'https://i.pinimg.com/736x/41/22/cd/4122cdeffc5d1b72139f660a8d306f0c.jpg',
    'https://i.pinimg.com/736x/60/76/36/6076364251d95c3febb1832702d57159.jpg',
    'https://i.pinimg.com/736x/47/7f/10/477f109863f77c9e66b4101fcae307f0.jpg',
    'https://i.pinimg.com/736x/b9/d8/b3/b9d8b39fff2136661ea2d1406746daed.jpg',
    'https://i.pinimg.com/736x/58/e5/73/58e5730c64f3962801501c5cee888568.jpg',
    'https://i.pinimg.com/736x/0a/c9/b7/0ac9b7ce7396fd99decdc7f18e32989f.jpg',
    'https://i.pinimg.com/736x/08/78/86/0878862e26d9c2e1308553e5cddac93c.jpg',
    'https://i.pinimg.com/736x/ee/71/70/ee71706ba3bb458aba6f0a3a948309d8.jpg',
    'https://i.pinimg.com/736x/b9/11/e0/b911e00143a4f101f69136ebda950f2f.jpg',
    'https://i.pinimg.com/736x/1b/59/44/1b5944c4b854cf028c82a7738b871743.jpg',
    'https://i.pinimg.com/736x/90/e6/28/90e628777d892abb7d38d5026ad1125e.jpg',
    'https://i.pinimg.com/736x/41/16/a6/4116a654c11c0720c0ff12faeb139385.jpg',
    'https://i.pinimg.com/736x/55/fb/8b/55fb8b755cb886e174c7efc6f2a36012.jpg',
    'https://i.pinimg.com/736x/93/9c/e9/939ce9f4986ca458c0d49ab3553260ea.jpg',
    'https://i.pinimg.com/736x/52/e8/03/52e8039f1cac4cb3c70cfdfc00c85085.jpg',
    'https://i.pinimg.com/736x/a4/7a/72/a47a72f599e6ac91443bfe803f4f6db9.jpg',
    'https://i.pinimg.com/736x/5a/d9/7c/5ad97c5bb4573b4d57a917925441b3f5.jpg',
    'https://i.pinimg.com/736x/7d/97/f5/7d97f5b01d6ed00b274255d3da316e09.jpg',
    'https://i.pinimg.com/736x/c4/ea/aa/c4eaaaecda37f864898294ea240f42db.jpg',
    'https://i.pinimg.com/736x/48/30/14/4830142def4bf2165fbe8bb51de57cad.jpg',
    'https://i.pinimg.com/736x/ee/b9/39/eeb93926643415915ba2a5e12d90d1fc.jpg',
    'https://i.pinimg.com/736x/97/f0/39/97f039a6de27a49657bd8e5babeafa04.jpg',
    'https://i.pinimg.com/736x/a1/1e/da/a11eda57fae9f9e351941a9314bfb6de.jpg',
    'https://i.pinimg.com/736x/a1/97/31/a19731298af4f0ded15f1dc472ca96df.jpg',
    'https://i.pinimg.com/736x/36/8a/71/368a715345a81bd5183d87974e3eb6c5.jpg',
    'https://i.pinimg.com/736x/ce/61/2f/ce612fc2452cfcf7481119af59fd0cb1.jpg',
    'https://i.pinimg.com/736x/2a/45/3f/2a453fd86df18cc7f349b1ca0824726e.jpg',
    'https://i.pinimg.com/736x/fd/0a/36/fd0a360286d54fa7ab0bc5b6aca86e00.jpg',
    'https://i.pinimg.com/736x/1d/2b/a3/1d2ba34c4f0ed89bd3959211f8fb45e1.jpg',
    'https://i.pinimg.com/736x/97/ff/f3/97fff3055424625c1527cd1ed2ae08ae.jpg',
    'https://i.pinimg.com/736x/9c/31/d5/9c31d5762c32e1dfae5f3e75ab0eea4a.jpg',
    'https://i.pinimg.com/736x/1f/21/d1/1f21d1a2d9060604c977782b947193d6.jpg',
    'https://i.pinimg.com/736x/a1/a3/b3/a1a3b36c526973e4ac4191566e0252ac.jpg',
    'https://i.pinimg.com/736x/01/c0/8b/01c08b2dc200568f547cb0ac7f75b85e.jpg',
    'https://i.pinimg.com/736x/f0/9c/6c/f09c6c22599b0327d1d069aeb9eb3fcc.jpg',
    'https://i.pinimg.com/736x/42/2d/e5/422de5e4e1527b73cfc1feea3dd17892.jpg',
    'https://i.pinimg.com/736x/00/59/0e/00590e4b4a24c2ee716af2abe7e17384.jpg',
    'https://i.pinimg.com/736x/4a/98/6c/4a986c06dcd1eaea4d1cdb60ce80a95a.jpg',
    'https://i.pinimg.com/736x/90/4d/10/904d105a67136ab815df889a5b3f2697.jpg',
    'https://i.pinimg.com/736x/46/99/b7/4699b7ba050d08e939c9795a410da87c.jpg',
    'https://i.pinimg.com/736x/a9/15/2c/a9152c933c920eb8f1b206ecbda5d295.jpg',
    'https://i.pinimg.com/736x/ea/b1/fc/eab1fc30774d578f9af38b0a5f3ce8fe.jpg',
    'https://i.pinimg.com/736x/95/44/ac/9544acdd1427a2c383190d9b00ce6283.jpg',
    'https://i.pinimg.com/736x/78/bc/30/78bc30a77cead8079f176ea4e92f39fa.jpg',
    'https://i.pinimg.com/736x/27/bd/ec/27bdec21db47b578d2d5cf5449629a96.jpg',
    'https://i.pinimg.com/736x/de/30/81/de30819049044ab7a2f579aea0709995.jpg',
    'https://i.pinimg.com/736x/9d/ce/c0/9dcec0b667f967232918675e746709d8.jpg',
    'https://i.pinimg.com/736x/7c/7e/95/7c7e954df2f6fedd1c118cd410f7d79e.jpg',
    'https://i.pinimg.com/736x/9d/98/27/9d9827f76d3ef4e51ac81fb4a03fb153.jpg',
    'https://i.pinimg.com/736x/a2/a9/c0/a2a9c04a53dc187f56b8f5c12997bb6a.jpg',
    'https://i.pinimg.com/736x/3b/4d/ff/3b4dff8ae780f33948a7609ac4198be4.jpg',
    'https://i.pinimg.com/736x/e5/19/62/e5196208ea2c52258440fc824ffba283.jpg',
    'https://i.pinimg.com/736x/76/d6/35/76d6352aae0b40de9c488a5c452161a8.jpg',
    'https://i.pinimg.com/736x/b8/43/63/b84363c6940b5516752dc3b773a55aa4.jpg',
    'https://i.pinimg.com/736x/e7/0d/e5/e70de5f092387a85009b423f97d74444.jpg',
    'https://i.pinimg.com/736x/86/3b/bd/863bbd4c43aad962b85b9ac68f8e0562.jpg',
    'https://i.pinimg.com/736x/4e/74/e1/4e74e106674fd5d4122835e62e3aee7b.jpg',
    'https://i.pinimg.com/736x/a3/ca/5a/a3ca5a9b962445ea5244320dc22fd195.jpg',
    'https://i.pinimg.com/736x/83/bc/15/83bc1546be42f14729ee3eddf1d78d4f.jpg',
    'https://i.pinimg.com/736x/3f/99/33/3f9933a9e3c5c5b3f70eb23605474a65.jpg',
    'https://i.pinimg.com/736x/e9/fe/fa/e9fefa30fd07a206334a30dd33dd5a6d.jpg',
    'https://i.pinimg.com/736x/68/4b/f7/684bf742569b2dd3fc57bb9d7eb3fcd3.jpg',
    'https://i.pinimg.com/736x/62/03/04/620304a205640289243f2449a55106d6.jpg',
    'https://i.pinimg.com/736x/50/31/e5/5031e58528e9d106c274ec6567045da3.jpg',
    'https://i.pinimg.com/736x/08/37/48/083748d761db507f4910db7101604bd4.jpg',
    'https://i.pinimg.com/736x/f9/c4/92/f9c49280e11377dbbf419c4afe75d8dc.jpg',
    'https://i.pinimg.com/736x/aa/3f/a6/aa3fa61df061d57f79d365291c802ca3.jpg',
    'https://i.pinimg.com/736x/d5/3d/b7/d53db718c0fa08a65212269b8b724cb5.jpg',
    'https://i.pinimg.com/736x/42/0d/20/420d204ec023aad387d9af9bcc07520f.jpg',
    'https://i.pinimg.com/736x/5c/b2/8e/5cb28e49af6caa19672c0d9e8d0c2081.jpg',
    'https://i.pinimg.com/736x/32/f5/8d/32f58d2a9cc72f8098188922ec4ad07c.jpg',
    'https://i.pinimg.com/736x/c5/1d/15/c51d15ed3b3909d7863a61205792b332.jpg',
    'https://i.pinimg.com/736x/d5/ed/9d/d5ed9d215a927c0e1c54438fc8e35e1d.jpg',
    'https://i.pinimg.com/736x/8d/db/ee/8ddbee72f910cd2058f5dceea8e05de3.jpg',
    'https://i.pinimg.com/736x/06/dc/3e/06dc3e4fd499171c95f60725c7fe52fc.jpg',
    'https://i.pinimg.com/736x/18/f7/ff/18f7ffb5371ea3e51f411f91bfa63fe2.jpg',
    'https://i.pinimg.com/736x/48/3e/ce/483ece9eed4a74637e00775642d8d008.jpg',
    'https://i.pinimg.com/736x/87/3a/cd/873acd2cafa855af20b2a6fd68492bbc.jpg',
    'https://i.pinimg.com/736x/b8/da/14/b8da148d7cfd5eecaffaae5af1cfe7f3.jpg',
    'https://i.pinimg.com/736x/9d/f3/d2/9df3d2589a1e7abec5d9dfc2bf4ff846.jpg',
    'https://i.pinimg.com/736x/08/8c/07/088c072f5ac3b2fc180dda9b2cd6b932.jpg',
    'https://i.pinimg.com/736x/b1/2e/a5/b12ea5f8b8c760aa4e643d367510f248.jpg',
    'https://i.pinimg.com/736x/19/63/6e/19636ec049b4fa6ec939b4d2684c790b.jpg',
    'https://i.pinimg.com/736x/9b/0e/66/9b0e66abf8ca7ead40bd53bc7f1f3a7b.jpg',
    'https://i.pinimg.com/736x/c5/c4/8e/c5c48edc2909e54c6941ebb6793c08f8.jpg',
    'https://i.pinimg.com/736x/17/bd/2f/17bd2f843c4faecb78f46f95010ea69c.jpg',
    'https://i.pinimg.com/736x/81/fa/30/81fa30cda13ad45af35896fcfae5e2e4.jpg',
    'https://i.pinimg.com/736x/04/5a/58/045a581cbd833e260e7dd2eff77d91a0.jpg',
    'https://i.pinimg.com/736x/01/48/6f/01486f3e95bb55c085273013509edc69.jpg',
    'https://i.pinimg.com/736x/a2/78/f6/a278f6e4a9ac37825fc8c32485496680.jpg',
    'https://i.pinimg.com/736x/43/61/e7/4361e710eeb6301fb0e3974cae2c2bfd.jpg',
    'https://i.pinimg.com/736x/85/72/3d/85723de6b06036f43ceb8990e69d1a34.jpg',
    'https://i.pinimg.com/736x/02/37/1c/02371c730b78852ef9140a897a8b387b.jpg',
    'https://i.pinimg.com/736x/f6/d0/f4/f6d0f4fd3d99a4a219c28576a2c9bd6e.jpg',
    'https://i.pinimg.com/736x/50/6f/f0/506ff0fc925e2adef5ec196bd13bf732.jpg',
    'https://i.pinimg.com/736x/ae/bb/de/aebbde352b8c483a6ff0b03713276f54.jpg',
    'https://i.pinimg.com/736x/ac/4f/75/ac4f75e2d4dd7e178fbc27a19360fac2.jpg',
    'https://i.pinimg.com/736x/a3/8c/02/a38c022ba1b510d83764f8e8ad4dce9c.jpg',
    'https://i.pinimg.com/736x/b0/17/ab/b017aba5f8fd2a817399ac27144d9b25.jpg',
    'https://i.pinimg.com/736x/8c/3c/ce/8c3cce4e8249bd8362c12d962b47f365.jpg',
    'https://i.pinimg.com/736x/0e/aa/46/0eaa466109a166fe8b39ccb2d0289900.jpg',
    'https://i.pinimg.com/736x/8b/c3/79/8bc379f6f1aefd18f3d66cc00ea46265.jpg',
    'https://i.pinimg.com/736x/89/f4/e1/89f4e1645a2db268c5cf6ea7e76c647a.jpg',
    'https://i.pinimg.com/736x/c0/f4/75/c0f475848e430a08e449372b3401ea14.jpg',
    'https://i.pinimg.com/736x/d1/24/98/d124989873db086bee1125fb96d0713a.jpg',
    'https://i.pinimg.com/736x/bc/84/08/bc84088dbc2f14825a449e159c68a5dd.jpg',
    'https://i.pinimg.com/736x/08/cb/aa/08cbaa3eeba439cd703c84e8f01900e6.jpg',
    'https://i.pinimg.com/736x/ae/fa/e6/aefae6759b4cd858dd1a4a7d3f2e8e11.jpg',
    'https://i.pinimg.com/736x/3c/bc/84/3cbc84f214bdfc538e57e417dbb88839.jpg',
    'https://i.pinimg.com/736x/0d/b8/9b/0db89b385927027019bfec6f2d76176e.jpg',
    'https://i.pinimg.com/736x/c6/fd/ee/c6fdee4fe17971ba578c6ea77e530cfe.jpg',
    'https://i.pinimg.com/736x/3c/81/16/3c8116de3f78c9f81a8f4050cff0e458.jpg',
    'https://i.pinimg.com/736x/a5/6d/80/a56d80fc4c55143e696a63f0fa0eadcd.jpg',
    'https://i.pinimg.com/736x/20/11/12/2011123cdbed3280530ceb5a2627631e.jpg',
    'https://i.pinimg.com/736x/5d/fd/6e/5dfd6e30646b2672361cf92c5204ec2c.jpg',
    'https://i.pinimg.com/736x/45/25/df/4525dff4339af41c430535a3968bbe79.jpg',
    'https://i.pinimg.com/736x/d5/09/25/d509257c2bc15a418105152bab85b7a2.jpg',
    'https://i.pinimg.com/736x/d5/e6/57/d5e657f5cc1dfcdc88f9ff0d1c727f28.jpg',
    'https://i.pinimg.com/736x/07/46/1e/07461e8a49be3c4a284de979ce136032.jpg',
    'https://i.pinimg.com/736x/29/8b/de/298bde6d56e8a147a535cb18449334fa.jpg',
    'https://i.pinimg.com/736x/be/ff/bc/beffbcce72ed0583dddf668193566c02.jpg',
    'https://i.pinimg.com/736x/3c/8e/f9/3c8ef940b630708961b8b85b5ba88992.jpg',
    'https://i.pinimg.com/736x/86/d8/62/86d8626b3fe39caf74263548a588ab97.jpg',
    'https://i.pinimg.com/736x/5c/72/f5/5c72f557d6f32cb537cff4fcda29e126.jpg',
    'https://i.pinimg.com/736x/83/58/0b/83580bcd71effd93bda9206ae57f1fb0.jpg',
    'https://i.pinimg.com/736x/b8/4a/a7/b84aa7f925074c88087ced1e7499ce97.jpg',
    'https://i.pinimg.com/736x/10/83/db/1083dbecb11cddbe37446292567ca292.jpg',
    'https://i.pinimg.com/736x/e6/4e/00/e64e00bfff52c6d68a55703e9c5f2d71.jpg',
    'https://i.pinimg.com/736x/44/01/96/440196991fcf889afdd8388d213183bf.jpg',
    'https://i.pinimg.com/736x/7f/3d/b9/7f3db95375a49e4a9ea061f2fc9caf02.jpg',
    'https://i.pinimg.com/736x/39/b4/40/39b440dbe1e838cfc721533b149001d8.jpg',
    'https://i.pinimg.com/736x/c7/32/70/c73270b9f5930176571eed5374bd594e.jpg',
    'https://i.pinimg.com/736x/94/0d/50/940d5041fb37ceb397fc6f5218af8557.jpg',
    'https://i.pinimg.com/736x/cf/84/16/cf8416f53b6d504adeab5c08e6cf3f39.jpg',
    'https://i.pinimg.com/736x/a9/76/9a/a9769a10d72d19a67372f985058b42ff.jpg',
    'https://i.pinimg.com/736x/f3/c0/ae/f3c0aea3e45e3f981a71ddd556e6c23a.jpg',
    'https://i.pinimg.com/736x/ab/c8/cc/abc8cc9aa505b20e01737dfb3b594696.jpg',
    'https://i.pinimg.com/736x/27/e0/cb/27e0cb8b1f9904284a8b2ecbc6b2145d.jpg',
    'https://i.pinimg.com/736x/e5/85/e8/e585e866e58918f42471a9be8415f672.jpg',
    'https://i.pinimg.com/736x/bf/42/eb/bf42eb6ae9f06a3fb10c228a86b10b15.jpg',
    'https://i.pinimg.com/736x/d7/13/83/d71383d2b28a02f625ac0f8db9408ee3.jpg',
    'https://i.pinimg.com/736x/2b/53/f0/2b53f0a8caab1bf078e1c0ff7aabf441.jpg',
    'https://i.pinimg.com/736x/f1/90/28/f190281881e375d8c86f1b98214e39a9.jpg',
    'https://i.pinimg.com/736x/6f/c5/cf/6fc5cf5cbcab6cce45edb62c64efe8e7.jpg',
    'https://i.pinimg.com/736x/ef/fe/56/effe56e88fb02f178424961a472feea6.jpg',
    'https://i.pinimg.com/736x/44/c7/aa/44c7aa7560fab233283748f4f3980feb.jpg',
    'https://i.pinimg.com/736x/fd/96/7e/fd967ec5499c3bde4c639f4da3b78b8c.jpg',
    'https://i.pinimg.com/736x/9f/f1/0a/9ff10a087a19e12ab2c4a6b1248edb1c.jpg',
    'https://i.pinimg.com/736x/25/6b/17/256b17dd0df13d6112b7e04474372090.jpg',
    'https://i.pinimg.com/736x/d4/26/3c/d4263c6637accd7fa5ee065487ea7517.jpg',
    'https://i.pinimg.com/736x/d6/0b/d5/d60bd522c858ce9c7b07fb254625e87d.jpg',
    'https://i.pinimg.com/736x/a9/a5/62/a9a5620b427a8074c2a0b72878ef9101.jpg',
    'https://i.pinimg.com/736x/8b/af/d0/8bafd0500a36436c358ebe052b1cfe74.jpg',
    'https://i.pinimg.com/736x/29/85/ca/2985ca673a0455eb28a0a0e35eb990e9.jpg',
    'https://i.pinimg.com/736x/6b/25/b5/6b25b5c3529d84cf58f9fd7019d7c451.jpg',
    'https://i.pinimg.com/736x/d8/3a/ad/d83aade3fe062a18f5f71e26fc75b5d4.jpg',
    'https://i.pinimg.com/736x/9b/e4/51/9be45162f4d8e38ba8ac5680e111f138.jpg',
    'https://i.pinimg.com/736x/bc/6b/b4/bc6bb40e6b32a270653fe4e9af628dde.jpg',
    'https://i.pinimg.com/736x/47/50/03/4750035cdef8589c39b1699062a6e1a3.jpg',
    'https://i.pinimg.com/736x/09/a8/77/09a8776392e0db2f9fe2358c3799e365.jpg',
    'https://i.pinimg.com/736x/a6/21/b4/a621b43be3aa559c72a504f19fb48095.jpg',
    'https://i.pinimg.com/736x/ee/c1/0c/eec10c996ac9ded47e0ff055f9182367.jpg',
    'https://i.pinimg.com/736x/7d/4e/5d/7d4e5dd8a45c9dfca51a165f20fca6ee.jpg',
    'https://i.pinimg.com/736x/2f/6a/ae/2f6aae3a7d10765d93accd7c23fcee29.jpg',
    'https://i.pinimg.com/736x/58/af/2e/58af2e163971d155e8f75149da7a5ea0.jpg',
    'https://i.pinimg.com/736x/3a/05/58/3a05588402179842e08519be0ee5a6b8.jpg',
    'https://i.pinimg.com/736x/70/cd/9e/70cd9e2aa58d3e5a362f44dc9320fabc.jpg',
    'https://i.pinimg.com/736x/86/3d/92/863d922c7ef9abe1972624df900b22b8.jpg',
    'https://i.pinimg.com/736x/78/dc/41/78dc41c3a16af95cd4de5a8618a63289.jpg',
    'https://i.pinimg.com/736x/99/ea/d2/99ead275d183ebb7ef389d5e47f38209.jpg',
    'https://i.pinimg.com/736x/ab/f6/f5/abf6f547d990666f4afce114f12ce983.jpg',
    'https://i.pinimg.com/736x/d0/b7/f6/d0b7f6dc777618ca93f5b475dc3502c8.jpg',
    'https://i.pinimg.com/736x/c6/9a/c1/c69ac1b88b681c6f393e39f72d040641.jpg',
    'https://i.pinimg.com/736x/67/d1/59/67d15936fadba9d1724baadbc279bcf3.jpg',
    'https://i.pinimg.com/736x/64/2d/a1/642da1e136ebff7319ae474647ea9fa2.jpg',
    'https://i.pinimg.com/736x/b2/80/c0/b280c0c06618fe609e556bab25a58cd8.jpg',
    'https://i.pinimg.com/736x/bf/fe/a9/bffea9faaa5bd514741ce7ab8c05c5fd.jpg',
    'https://i.pinimg.com/736x/d6/f8/6c/d6f86cd4b61d5d95ca6da14e5e5bdff3.jpg',
    'https://i.pinimg.com/736x/c7/d0/8d/c7d08d5ebf270b83096dc2de332ed95d.jpg',
    'https://i.pinimg.com/736x/6b/3f/a0/6b3fa044a82f73de8a7bdd58f2e62e9b.jpg',
    'https://i.pinimg.com/736x/e2/17/11/e2171194d53a400686647a36e08e5558.jpg',
    'https://i.pinimg.com/736x/ea/46/a5/ea46a553569cea7e33a54cb9160af20a.jpg',
    'https://i.pinimg.com/736x/88/33/86/883386cab2bf0e1e7b9ade96f3bed8a5.jpg',
    'https://i.pinimg.com/736x/94/98/38/9498381f882c3694a125ae94e1c3ac36.jpg',
    'https://i.pinimg.com/736x/c5/f2/25/c5f225f0a539b6cb5f2b718514418960.jpg',
    'https://i.pinimg.com/736x/9c/45/fe/9c45fe354cff8bca8965c94410251eb4.jpg',
    'https://i.pinimg.com/736x/42/cb/fc/42cbfc5636e22fe0c1471824a0840859.jpg',
    'https://i.pinimg.com/736x/9f/a2/4d/9fa24d866bc7c6e08b7298724efbcd32.jpg',
    'https://i.pinimg.com/736x/72/fa/44/72fa44ac9c065f0065a53aeea0e80b53.jpg',
    'https://i.pinimg.com/736x/64/1c/d9/641cd92de5c8a34a6ae943eacb84eaf8.jpg',
    'https://i.pinimg.com/736x/95/90/c4/9590c4a245a3bb40559d9e1776de9762.jpg',
    'https://i.pinimg.com/736x/b9/cf/35/b9cf3503fea11420b103e13f62783442.jpg',
    'https://i.pinimg.com/736x/b2/46/da/b246da516e40119a53a32a2c7eb95f9b.jpg',
    'https://i.pinimg.com/736x/51/01/7f/51017fa830de9f5a76d5c9f56ca80314.jpg',
    'https://i.pinimg.com/736x/4c/54/2b/4c542ba63c15b4648366e68713fb5fac.jpg',
    'https://i.pinimg.com/736x/ad/cc/31/adcc3167882e5f2442315851939e53ec.jpg',
    'https://i.pinimg.com/736x/d5/5c/84/d55c8414304e00fc9b56f9b5e16484c5.jpg',
    'https://i.pinimg.com/736x/00/0d/3d/000d3dda4e6bbbd4e174a3f7cb7584b1.jpg',
    'https://i.pinimg.com/736x/39/84/71/3984718e1e598819c64537ca8f834d0f.jpg',
    'https://i.pinimg.com/736x/14/32/7a/14327ad50f0b6dc44d4d0d5767d2afbe.jpg',
    'https://i.pinimg.com/736x/c9/6f/d9/c96fd95a509983807359f494a94812b9.jpg',
    'https://i.pinimg.com/736x/24/c6/0d/24c60dd24ce0bbcb6120a687207816f6.jpg',
    'https://i.pinimg.com/736x/04/3a/c8/043ac8c7d3fd6b981546140be75371d2.jpg',
    'https://i.pinimg.com/736x/0b/0e/3d/0b0e3ddffcf458bfcf4d395f9ec49b47.jpg',
    'https://i.pinimg.com/736x/29/f9/1f/29f91feec4560354191bed70812858cb.jpg',
    'https://i.pinimg.com/736x/24/40/25/2440253a09fea72a3780aee739b72338.jpg',
    'https://i.pinimg.com/736x/bd/e0/88/bde0887ca9be1f08f7bfb4d71bc1c649.jpg',
    'https://i.pinimg.com/736x/60/2f/4f/602f4fbb49822d7bfc509821180aca1c.jpg',
    'https://i.pinimg.com/736x/24/cb/78/24cb78f151b43c7d8e3fb4f6dfec8232.jpg',
    'https://i.pinimg.com/736x/ec/fa/20/ecfa20e4d6b3ff9986919dc6bab6e0a9.jpg',
    'https://i.pinimg.com/736x/10/e2/0f/10e20fda471b60bb6fd99cc6dcef221b.jpg',
    'https://i.pinimg.com/736x/b7/33/f3/b733f3bdcef568e01d5cf076e6462134.jpg',
    'https://i.pinimg.com/736x/5a/eb/ff/5aebffe9ac2e578d992c4e44f44d118d.jpg',
    'https://i.pinimg.com/736x/97/0d/c2/970dc27f6b18931ab89572465e5ebd86.jpg',
    'https://i.pinimg.com/736x/25/09/e6/2509e66f149115f1bf63d86505d17189.jpg',
    'https://i.pinimg.com/736x/9a/1d/28/9a1d28ef0734a249485315f768fc0eee.jpg',
    'https://i.pinimg.com/736x/55/71/0f/55710f3261048d473c3dfe01f9f0885f.jpg',
    'https://i.pinimg.com/736x/bf/e1/8f/bfe18f3f11d2198dd08e6299295b547d.jpg',
    'https://i.pinimg.com/736x/b1/a9/f9/b1a9f99aa71c64103ff015109cf65761.jpg',
    'https://i.pinimg.com/736x/cb/a5/e3/cba5e3e1b3c25045f706e2c8319b1148.jpg',
    'https://i.pinimg.com/736x/f4/0f/4c/f40f4c4ff30c1c7af26b585b38a53deb.jpg',
    'https://i.pinimg.com/736x/3c/79/d9/3c79d970259e586692b0dc273c63d60e.jpg',
    'https://i.pinimg.com/736x/ac/f0/4a/acf04ad6c25ae79626477dbfd3716006.jpg',
    'https://i.pinimg.com/736x/f7/78/76/f778762f30d961cf9ca2c33ad0595fc1.jpg',
    'https://i.pinimg.com/736x/a6/af/6b/a6af6bbd161a9b9079baccd894ba824c.jpg',
    'https://i.pinimg.com/736x/7e/46/49/7e464927cce3b63cd1028446b9a08fb7.jpg',
    'https://i.pinimg.com/736x/cd/2d/3c/cd2d3c705c92abf96ec31630a5a1f949.jpg',
    'https://i.pinimg.com/736x/79/e2/34/79e234fcd7cdce77623b1a07c4770f65.jpg',
    'https://i.pinimg.com/736x/a3/97/e4/a397e4b60ade9045370988549bfd18d2.jpg',
    'https://i.pinimg.com/736x/da/38/c6/da38c6e3844964c665ba5b7c3224b88f.jpg',
    'https://i.pinimg.com/736x/f6/83/e4/f683e4fb1674daf8760514e145231c3f.jpg',
    'https://i.pinimg.com/736x/1e/cf/4b/1ecf4b910c6ba25d748f094704796e96.jpg',
    'https://i.pinimg.com/736x/05/f5/e6/05f5e6f9bb1cb5cb633fe91bd5e7800c.jpg',
    'https://i.pinimg.com/736x/cf/2c/ff/cf2cff0597664e59f751d1a4c89cce42.jpg',
    'https://i.pinimg.com/736x/50/f3/54/50f35413e3e5a474bbfdfca317458f0b.jpg',
    'https://i.pinimg.com/736x/32/e9/07/32e9079d4cb6b4ac08080c1adf940816.jpg',
    'https://i.pinimg.com/736x/23/37/76/2337763fd126f0862259cea0b071872f.jpg',
    'https://i.pinimg.com/736x/27/80/79/278079e22488b220e1f59d1bcb536b25.jpg',
    'https://i.pinimg.com/736x/87/b1/b7/87b1b7bcaec7f955fdc6b9ad26811117.jpg',
    'https://i.pinimg.com/736x/b9/47/46/b9474643faaf641c1468b9c8f82289db.jpg',
    'https://i.pinimg.com/736x/bf/aa/a1/bfaaa1e990d00e6ca96c67f1759c38b7.jpg',
    'https://i.pinimg.com/736x/b5/7f/f4/b57ff4fc68a27a471b4487112e03c49a.jpg',
    'https://i.pinimg.com/736x/81/53/65/8153658b68a5dae251e5712db5cb40e2.jpg',
    'https://i.pinimg.com/736x/c4/f2/89/c4f289ef3ddcbceed5cba6c5a50f79d9.jpg',
    'https://i.pinimg.com/736x/d4/19/89/d41989eeff7f2972ca2d4e4f7ca65e3a.jpg',
  ],
  education: [
    'https://i.pinimg.com/736x/7a/75/57/7a7557a22d61cfba3b41ce0a09480880.jpg',
    'https://i.pinimg.com/736x/30/dd/67/30dd676b46a78b01268561aa4a000fab.jpg',
    'https://i.pinimg.com/736x/13/ea/2a/13ea2a88111f0aa2b051e792d10e592e.jpg',
    'https://i.pinimg.com/736x/1b/f7/7f/1bf77f34d00341289eb9e6e0169e1dd2.jpg',
    'https://i.pinimg.com/736x/5a/f0/95/5af0957194a11c8dc750c97bd3abe8bd.jpg',
    'https://i.pinimg.com/736x/87/c2/02/87c202dd5e44325078253a4e28856fa4.jpg',
    'https://i.pinimg.com/736x/4c/c1/bb/4cc1bba169f405e7174160081cc037d1.jpg',
    'https://i.pinimg.com/736x/08/fb/3b/08fb3b8d3f5e34bbbd4f6990bafc3c2b.jpg',
    'https://i.pinimg.com/736x/a5/f8/20/a5f820655ca977a033b260dd6fe28336.jpg',
    'https://i.pinimg.com/736x/69/70/ae/6970aea0d4bd4812f69bd19275c83985.jpg',
    'https://i.pinimg.com/736x/69/50/8f/69508fc9a4c818c351871c79ca674e47.jpg',
    'https://i.pinimg.com/736x/02/ea/d3/02ead3e0c91dd8cdba28036fe795ffff.jpg',
    'https://i.pinimg.com/736x/cf/39/15/cf3915b10fa13a13f0f41d17dc145b3e.jpg',
    'https://i.pinimg.com/736x/79/61/c9/7961c9f4a07a4acdec629ad70ddf6007.jpg',
    'https://i.pinimg.com/736x/3d/e0/7a/3de07a7cb2850ff426714d9abdd3e7f0.jpg',
    'https://i.pinimg.com/736x/85/e9/e2/85e9e2586e847f3ce0316a9406c74dcb.jpg',
    'https://i.pinimg.com/736x/ea/ec/eb/eaeceb0cbc6030e02722d44965228b79.jpg',
    'https://i.pinimg.com/736x/4b/73/e0/4b73e0972fcae055f7e8442cc20d328f.jpg',
    'https://i.pinimg.com/736x/1e/f9/b1/1ef9b1c640672ff52b58e82101ffcf43.jpg',
    'https://i.pinimg.com/736x/e7/ab/25/e7ab2534e003ca6c67d9c2d09648e5ca.jpg',
    'https://i.pinimg.com/736x/87/2f/59/872f59ce67b0a18f6992ff12f45575c7.jpg',
    'https://i.pinimg.com/736x/c6/8a/63/c68a63099bae9628d811cb0655e9762d.jpg',
    'https://i.pinimg.com/736x/17/64/dd/1764ddd39283f42ae1a729032dbfb318.jpg',
    'https://i.pinimg.com/736x/ac/f9/dc/acf9dca3829d993adda261ad76854a3e.jpg',
    'https://i.pinimg.com/736x/7e/e1/66/7ee166a495cdb5e9aa3f5a82c8c19c2f.jpg',
    'https://i.pinimg.com/736x/8e/9c/24/8e9c24ebe44b05d3afd88b691b38fa8e.jpg',
    'https://i.pinimg.com/736x/1c/b8/ae/1cb8ae7c74c26f569f88bd8fbabcb028.jpg',
    'https://i.pinimg.com/736x/7c/4f/57/7c4f5717a9ec28ce1b77af51b5500fa0.jpg',
    'https://i.pinimg.com/736x/f4/d5/f0/f4d5f01e11627da9d86c6b8b3be7b8ae.jpg',
    'https://i.pinimg.com/736x/eb/cd/ea/ebcdead3afb55515069f85e72b8dfa04.jpg',
    'https://i.pinimg.com/736x/e4/91/90/e4919007c62a56ba17c5ce131df63791.jpg',
    'https://i.pinimg.com/736x/5e/ab/8b/5eab8b5ffde1552f0777f86341fa29e8.jpg',
    'https://i.pinimg.com/736x/bd/79/36/bd7936886c441372dd0f6e5649fbc106.jpg',
    'https://i.pinimg.com/736x/49/b2/a3/49b2a3ab90207af6ad3dee3028d6a97c.jpg',
    'https://i.pinimg.com/736x/5c/e4/17/5ce4172b1348c6c1978e8fd910eb97c3.jpg',
    'https://i.pinimg.com/736x/2e/fd/e0/2efde03f3cede39a010d30d187a6d1b2.jpg',
    'https://i.pinimg.com/736x/07/2f/6c/072f6cbd1ed54e2f78cd3fa572d6d304.jpg',
    'https://i.pinimg.com/736x/3c/42/ce/3c42ce147d45f1894ddd25e81423838d.jpg',
    'https://i.pinimg.com/736x/2c/ea/f3/2ceaf34cc8fa21447ac5f069d8d46a61.jpg',
    'https://i.pinimg.com/736x/5d/aa/3c/5daa3c6b7cd4e241b129fb44ffcd7fb0.jpg',
    'https://i.pinimg.com/736x/6a/1a/90/6a1a9022aef5352b3812d8a4f4ce9d96.jpg',
    'https://i.pinimg.com/736x/bc/38/8f/bc388f558b087fb7a0f6dbcf09099cdb.jpg',
    'https://i.pinimg.com/736x/ba/41/b7/ba41b72b8234c4d70b90f5bc9f38613d.jpg',
    'https://i.pinimg.com/736x/5e/e8/d6/5ee8d67f13609d785dc2abbae4d95729.jpg',
    'https://i.pinimg.com/736x/94/01/5b/94015bfc0666148e34ea6f0be7c5ac06.jpg',
    'https://i.pinimg.com/736x/af/a1/64/afa164a7172bcd157564d0aa8dfb2399.jpg',
    'https://i.pinimg.com/736x/6c/6f/85/6c6f858e81608ad6495dc74b99a0d82b.jpg',
    'https://i.pinimg.com/736x/22/ee/4b/22ee4b4c5187a8df4156e3fac825ead1.jpg',
    'https://i.pinimg.com/736x/48/bc/36/48bc36e3745e75e57cd8e158dd37944b.jpg',
    'https://i.pinimg.com/736x/60/02/c9/6002c9fc0650c160d09fc95b62ed1ba0.jpg',
    'https://i.pinimg.com/736x/b9/b6/b4/b9b6b4a0f69a10954eb72d37871c0c8b.jpg',
    'https://i.pinimg.com/736x/21/36/43/21364381e696657c63aa92b616681107.jpg',
    'https://i.pinimg.com/736x/e5/3c/11/e53c1188e54ea079ad3b171bbbfec7e6.jpg',
    'https://i.pinimg.com/736x/71/6c/bd/716cbd2ac6f36ff3b8b623a27b59a363.jpg',
    'https://i.pinimg.com/736x/87/82/a2/8782a2714a1174cfd7625c80335fcf8c.jpg',
    'https://i.pinimg.com/736x/2c/78/4c/2c784cc695e4ca5c1b4624bd10e0efa2.jpg',
    'https://i.pinimg.com/736x/de/9e/c9/de9ec9ed823bd159add1277b5657dfde.jpg',
    'https://i.pinimg.com/736x/4b/9b/42/4b9b423be44bf18ee66beed422f58223.jpg',
    'https://i.pinimg.com/736x/13/3a/ac/133aac089e969f973d9dd5072678eda3.jpg',
    'https://i.pinimg.com/736x/dc/16/2a/dc162a254ac2567c941b55160507fe06.jpg',
    'https://i.pinimg.com/736x/7e/2f/dd/7e2fdd516cd40f113f259e36de024ea1.jpg',
    'https://i.pinimg.com/736x/a4/20/3f/a4203f38cacbf69db5ef29f90583dba3.jpg',
    'https://i.pinimg.com/736x/ec/0d/3e/ec0d3eb7a1dc60ddc8590477ea57a029.jpg',
    'https://i.pinimg.com/736x/f5/ec/cf/f5eccfe5f522a281927d9f61e80ac12e.jpg',
    'https://i.pinimg.com/736x/2e/ab/f0/2eabf081ca56d03546695e1424cc3762.jpg',
    'https://i.pinimg.com/736x/64/64/d2/6464d2b47e3a84cbf7755254ead8196a.jpg',
    'https://i.pinimg.com/736x/20/c1/04/20c104b0419958be9cc6843144d11e9f.jpg',
    'https://i.pinimg.com/736x/ee/70/89/ee708951cc97bda5af826ddb6bc5b157.jpg',
    'https://i.pinimg.com/736x/f2/6d/7c/f26d7c56ac620f38ab2499f095c8b4c4.jpg',
    'https://i.pinimg.com/736x/51/f7/ee/51f7eedd28879e3cb448e8d8efd8c858.jpg',
    'https://i.pinimg.com/736x/8c/ff/5e/8cff5e763c1384307e122a8e57983aed.jpg',
    'https://i.pinimg.com/736x/d8/f8/d1/d8f8d1ea711657d293dda53b10f4c8ec.jpg',
    'https://i.pinimg.com/736x/5f/fc/40/5ffc40c33b34480d0b127d4c00fd53ec.jpg',
    'https://i.pinimg.com/736x/cb/18/29/cb1829fc76beb73a6bccd1d16303a7ad.jpg',
    'https://i.pinimg.com/736x/b2/4a/d2/b24ad27e8317b6ede0301b20b3db78c4.jpg',
    'https://i.pinimg.com/736x/33/53/37/33533704e263c99408a8744e2d815825.jpg',
    'https://i.pinimg.com/736x/84/d8/3c/84d83cf755809ddd2791ee8b2d464ae4.jpg',
    'https://i.pinimg.com/736x/bd/36/c3/bd36c3e9652fb0962ab4ea2a3bc75815.jpg',
    'https://i.pinimg.com/736x/6d/43/2a/6d432a039c7975092e6d4f51d5639c78.jpg',
    'https://i.pinimg.com/736x/47/e2/ad/47e2ad287e37a65bd59437cb6c80c982.jpg',
    'https://i.pinimg.com/736x/e3/87/10/e387101a0d0bfa30da97094d9708cbbb.jpg',
    'https://i.pinimg.com/736x/10/d5/4e/10d54e8c6bb8909f3bd70dc8c0e4891c.jpg',
    'https://i.pinimg.com/736x/73/13/f8/7313f8345e88b3d26c93d43a6586a096.jpg',
    'https://i.pinimg.com/736x/8c/d5/0c/8cd50c9ee57a84f27cb676cf0f454ee0.jpg',
    'https://i.pinimg.com/736x/6d/94/60/6d94603cea357f8245c9392c70021f07.jpg',
    'https://i.pinimg.com/736x/55/40/ad/5540ada22447de516485561361afca35.jpg',
    'https://i.pinimg.com/736x/c9/74/95/c974955658aee31dc45e3887e3899fbd.jpg',
    'https://i.pinimg.com/736x/d5/b0/fa/d5b0fa34cd03c756b2c764e1b5e35258.jpg',
    'https://i.pinimg.com/736x/c6/7c/5b/c67c5bd3bf82f572d375201bb7be21a2.jpg',
    'https://i.pinimg.com/736x/b6/7e/86/b67e86391ce17a4502fffe5bd1fe164a.jpg',
    'https://i.pinimg.com/736x/90/17/13/901713669cf3299162ee9c12844fb53c.jpg',
    'https://i.pinimg.com/736x/92/e4/58/92e458ef53cfe7859ab31773f7166b55.jpg',
    'https://i.pinimg.com/736x/05/37/2a/05372a75f5e560eaa28575c35e443319.jpg',
    'https://i.pinimg.com/736x/da/71/93/da7193c5843e6271ba2d3d5c1c6cd811.jpg',
    'https://i.pinimg.com/736x/e7/1e/0a/e71e0a5b879a2b7d239fb43efbfee9aa.jpg',
    'https://i.pinimg.com/736x/23/c3/46/23c346ecf651e4f4c234afa9a620a35a.jpg',
    'https://i.pinimg.com/736x/1c/17/06/1c17064baf172b766b655cbbabf348db.jpg',
    'https://i.pinimg.com/736x/9d/a6/ba/9da6ba9a97b556149a47fe93f6f414ef.jpg',
    'https://i.pinimg.com/736x/4c/d3/98/4cd398d4bb2c495f27be4752bf14c19f.jpg',
    'https://i.pinimg.com/736x/c1/c9/1d/c1c91d12122e4359dd75bfb9ed294083.jpg',
    'https://i.pinimg.com/736x/69/3c/aa/693caac5c4ee2e0be66b89023c2a9e3b.jpg',
    'https://i.pinimg.com/736x/2b/fa/ed/2bfaed427fd780c369727c1f7ff2b527.jpg',
    'https://i.pinimg.com/736x/6f/b8/f3/6fb8f34b13a47fef6b40a5194e0dea3f.jpg',
    'https://i.pinimg.com/736x/09/b1/a2/09b1a2ca8263e122b15a37b8911423e4.jpg',
    'https://i.pinimg.com/736x/fc/aa/8c/fcaa8c168b51ac64b45a67d4639980c6.jpg',
    'https://i.pinimg.com/736x/82/de/ca/82deca4b710a89df3b924ce8e1e735c1.jpg',
    'https://i.pinimg.com/736x/dc/68/22/dc682241ea298e2e35388c6636b0aa2a.jpg',
    'https://i.pinimg.com/736x/d8/db/66/d8db660a570836427243c46d18e6b2c3.jpg',
    'https://i.pinimg.com/736x/65/3c/92/653c9231c75ea47024f5e5e82acf296d.jpg',
    'https://i.pinimg.com/736x/1a/14/06/1a140602d6f016097fa57c0183debfe0.jpg',
    'https://i.pinimg.com/736x/df/d0/8a/dfd08a466363a5e9ab9eebc8a0b6a3ec.jpg',
    'https://i.pinimg.com/736x/c7/bc/02/c7bc0229278046725d64f838ab7d1a9c.jpg',
    'https://i.pinimg.com/736x/64/73/1e/64731e2dabc00f574e8d8fbeb72ad606.jpg',
    'https://i.pinimg.com/736x/cf/5c/27/cf5c2720e2b9642027dca051c041c5f2.jpg',
    'https://i.pinimg.com/736x/52/f2/a8/52f2a8338e1223118bf4fbabd304206b.jpg',
    'https://i.pinimg.com/736x/67/68/b7/6768b7cd5aa2b6829ec0f9ac474e13bd.jpg',
    'https://i.pinimg.com/736x/e8/e8/d1/e8e8d1ac2575ebc6882b93017b5e73d2.jpg',
    'https://i.pinimg.com/736x/eb/75/30/eb75301bc27c2a9af5359ad45330c0f5.jpg',
    'https://i.pinimg.com/736x/b6/e3/8a/b6e38a86a777ea9dbb38de30fca3c87a.jpg',
    'https://i.pinimg.com/736x/e9/62/3b/e9623bc3535839e809d8bb1aac736bc2.jpg',
    'https://i.pinimg.com/736x/ec/83/eb/ec83eb86a7c30183b5bdad44cbff856d.jpg',
    'https://i.pinimg.com/736x/d9/46/03/d94603b3c8881a89579e3cb74682009f.jpg',
    'https://i.pinimg.com/736x/75/a6/a5/75a6a5521b62af779c472aed9bcd4e0c.jpg',
    'https://i.pinimg.com/736x/d8/ed/52/d8ed521b3e32b72b26ac6722ea791179.jpg',
    'https://i.pinimg.com/736x/64/1a/7e/641a7e5d23b0f4a728db01c8963fc115.jpg',
    'https://i.pinimg.com/736x/d5/b6/9b/d5b69bf57888ab415e2c796a5902047c.jpg',
    'https://i.pinimg.com/736x/86/f4/91/86f491673493fce330d5e7532876246d.jpg',
    'https://i.pinimg.com/736x/29/9e/58/299e58574591505c326692897c2e0a44.jpg',
    'https://i.pinimg.com/736x/fa/90/6d/fa906dca7e0cd76235a6ff03bb150022.jpg',
    'https://i.pinimg.com/736x/dd/bf/c1/ddbfc175b43848bd273588f0495d7626.jpg',
    'https://i.pinimg.com/736x/2b/90/6c/2b906cc021cbc207fd3e624b0c90bbbf.jpg',
    'https://i.pinimg.com/736x/55/62/57/556257040ca1bb30bc4f297f6a79d8ed.jpg',
    'https://i.pinimg.com/736x/1a/5a/6e/1a5a6e4fbb99af6fc20e22ba9d99793d.jpg',
    'https://i.pinimg.com/736x/8a/0a/ea/8a0aeabee534879fd3725d353196ef97.jpg',
    'https://i.pinimg.com/736x/5f/15/26/5f15262b5361d1b5ac01ea1a0bd9b4ce.jpg',
    'https://i.pinimg.com/736x/0b/90/f5/0b90f554fd418f461424428f447fe2f9.jpg',
    'https://i.pinimg.com/736x/33/ad/5b/33ad5b0c0a81b5cb5a039712bd4dd5b0.jpg',
    'https://i.pinimg.com/736x/06/34/1d/06341d30eec744bdb4a12f18d9ebc65c.jpg',
    'https://i.pinimg.com/736x/bf/bb/6d/bfbb6dbd65493b62e62f6908f7f6932c.jpg',
    'https://i.pinimg.com/736x/72/86/83/728683c2c95162752072621a05fdc30d.jpg',
    'https://i.pinimg.com/736x/f1/57/24/f15724992874ecca924842a6b926442c.jpg',
    'https://i.pinimg.com/736x/ac/93/21/ac932154def365a1ad4a515f532556ff.jpg',
    'https://i.pinimg.com/736x/d9/55/b5/d955b5d49a406cbd1897f12fc50bf64c.jpg',
    'https://i.pinimg.com/736x/36/96/e9/3696e9b6eba39e9a7c35f83848d9d0e2.jpg',
    'https://i.pinimg.com/736x/c0/43/b8/c043b81f491ff94bc1854f518a0dbdbb.jpg',
    'https://i.pinimg.com/736x/52/0c/d0/520cd0ae86b0cb631122725001568a94.jpg',
    'https://i.pinimg.com/736x/c5/13/17/c51317c6f68ea1341a746c45611042e4.jpg',
    'https://i.pinimg.com/736x/ef/b6/d2/efb6d29d6b2d99b0ded4c393bf3a5822.jpg',
    'https://i.pinimg.com/736x/bc/8f/6f/bc8f6f6a7ee74ada4ac31488be2499da.jpg',
    'https://i.pinimg.com/736x/30/f2/2c/30f22c5fa8b08ed20497ab922c535f93.jpg',
    'https://i.pinimg.com/736x/df/2d/b5/df2db568a1ea994dd938dba27e1711b9.jpg',
    'https://i.pinimg.com/736x/23/f4/37/23f437e0e593f778a20c9c915e22e44f.jpg',
    'https://i.pinimg.com/736x/77/4b/64/774b64ec74039a2882f19a22a440c0bf.jpg',
    'https://i.pinimg.com/736x/e4/37/9c/e4379c645ad90f0bfa54a042a82fb820.jpg',
    'https://i.pinimg.com/736x/f9/b4/10/f9b410b6fea28ffb75c78d308cafaa50.jpg',
    'https://i.pinimg.com/736x/46/77/5e/46775e33144d77b42522016abeebaef2.jpg',
    'https://i.pinimg.com/736x/c1/52/a6/c152a663d62a883d382351307d6cc318.jpg',
    'https://i.pinimg.com/736x/de/28/c8/de28c83ac82c878485d5944a85b648d7.jpg',
    'https://i.pinimg.com/736x/4c/f8/4f/4cf84f5bcc9068c7b2c31de581fa4eee.jpg',
    'https://i.pinimg.com/736x/16/78/93/167893fc618d0e9d969e839843037a0c.jpg',
    'https://i.pinimg.com/736x/a4/9b/5c/a49b5c7d2ccb1dec03e5b5e98cf4ff00.jpg',
    'https://i.pinimg.com/736x/c0/00/48/c00048a3db46f09a528e5230f35b0b91.jpg',
    'https://i.pinimg.com/736x/19/07/72/190772547e272cfb27b67db887374a6b.jpg',
    'https://i.pinimg.com/736x/ad/40/84/ad40842b3346d7cb7ea6c6247ec679c9.jpg',
    'https://i.pinimg.com/736x/d9/94/c2/d994c23ebdd01302850c1d488baf9375.jpg',
    'https://i.pinimg.com/736x/a8/41/18/a84118a19f3440e5d205955f9f8ae944.jpg',
    'https://i.pinimg.com/736x/26/3d/27/263d273941d7add9983f51ff4f4025c0.jpg',
    'https://i.pinimg.com/736x/8a/57/cd/8a57cd868c792bdacc3014f2a0b54984.jpg',
    'https://i.pinimg.com/736x/e1/89/d2/e189d2c6ca84360f4a6c0717d43bbad5.jpg',
    'https://i.pinimg.com/736x/f8/ce/38/f8ce38e11e6881038d3be8737ab923c3.jpg',
    'https://i.pinimg.com/736x/e1/26/9b/e1269ba97a558981038074fa25419260.jpg',
    'https://i.pinimg.com/736x/52/50/f8/5250f8b3555b18e89266964e1fb11f50.jpg',
    'https://i.pinimg.com/736x/12/c2/24/12c224dc8e1c6da6ee2ca6429b8b3b7c.jpg',
    'https://i.pinimg.com/736x/0c/c7/ae/0cc7ae192223965e567e51b976b650a7.jpg',
    'https://i.pinimg.com/736x/09/19/cb/0919cba61239841efbdcf06e251fa3ed.jpg',
    'https://i.pinimg.com/736x/09/a3/d9/09a3d9742a0cfa9db7658973f22298fa.jpg',
    'https://i.pinimg.com/736x/26/6a/89/266a890498addae111daba8c7302dc17.jpg',
    'https://i.pinimg.com/736x/3a/e9/92/3ae99271b76dbf98c2cacd7096166918.jpg',
    'https://i.pinimg.com/736x/90/dc/47/90dc4739ccdf9c04c4e8cd4de8e2f67a.jpg',
    'https://i.pinimg.com/736x/33/46/27/3346277baeca153d106663013a20b841.jpg',
    'https://i.pinimg.com/736x/ad/0b/49/ad0b49371f364099e7aa7d8221eab7e7.jpg',
    'https://i.pinimg.com/736x/1b/72/93/1b7293aaa00d2094921a3e88ccd9bbb2.jpg',
    'https://i.pinimg.com/736x/59/52/28/595228cb2666c7d1ffa2916048ea1dc9.jpg',
    'https://i.pinimg.com/736x/cf/bd/6d/cfbd6d622a0c2502f9520652bd2bb473.jpg',
    'https://i.pinimg.com/736x/87/0c/8f/870c8f83e510febab122409dd632963f.jpg',
    'https://i.pinimg.com/736x/3e/c7/0f/3ec70f2571380a967c51e7883188ab7d.jpg',
    'https://i.pinimg.com/736x/e8/d9/a3/e8d9a3ab49732fbb130aaffcca9c887c.jpg',
    'https://i.pinimg.com/736x/fc/0b/3f/fc0b3ffff33105ff1adf60b32554bac1.jpg',
    'https://i.pinimg.com/736x/ad/1c/6a/ad1c6ab2d645cc6e4ceab56fe6d84bb8.jpg',
    'https://i.pinimg.com/736x/4b/fb/1a/4bfb1a2564c82b200a8b269e1a3e66d1.jpg',
    'https://i.pinimg.com/736x/57/56/29/5756295077f488fb2ab9e631acf799c3.jpg',
    'https://i.pinimg.com/736x/c2/12/a0/c212a0a2b564076180cf691a0875df28.jpg',
    'https://i.pinimg.com/736x/0e/a5/32/0ea532dd54e08bb88fa8333ddd4e492f.jpg',
    'https://i.pinimg.com/736x/02/d4/b3/02d4b3a1589028e701f59473464e4642.jpg',
    'https://i.pinimg.com/736x/28/1c/47/281c478d8a165caf66ab918016121073.jpg',
    'https://i.pinimg.com/736x/fe/19/97/fe19974175275f8aced26ee5d65d7bef.jpg',
    'https://i.pinimg.com/736x/f5/f2/a9/f5f2a9bdb0b2fea35ae9ad622e46c814.jpg',
    'https://i.pinimg.com/736x/6a/32/8b/6a328b45dd2eda185724b2eb5d86760a.jpg',
    'https://i.pinimg.com/736x/59/86/a9/5986a96b6a437c79d773a3af33ed2033.jpg',
    'https://i.pinimg.com/736x/f3/13/b5/f313b5a710f0b369e58f11305eaa100c.jpg',
    'https://i.pinimg.com/736x/3d/60/07/3d60073b5d8a0e53f7098fe4b06a509c.jpg',
    'https://i.pinimg.com/736x/3b/69/bb/3b69bbad884d5a728979ef0635eb1a6a.jpg',
    'https://i.pinimg.com/736x/65/89/8f/65898fc2fb425d41d84e135a1ef6f524.jpg',
    'https://i.pinimg.com/736x/9b/6b/cf/9b6bcf44a5305f77efa88e54daf14e32.jpg',
    'https://i.pinimg.com/736x/fb/fd/68/fbfd6884327ce5aebc34bbc78528766f.jpg',
    'https://i.pinimg.com/736x/17/a4/fa/17a4faec422e4144f21b46dd4247cb42.jpg',
    'https://i.pinimg.com/736x/5d/c6/f1/5dc6f1ab3f0cda55688d0d6270647e7c.jpg',
    'https://i.pinimg.com/736x/f5/cc/97/f5cc97fd1cb9c8cb8c8196b510907d91.jpg',
    'https://i.pinimg.com/736x/7a/e9/57/7ae957a9a9d4559b046dbfd55d5d8041.jpg',
    'https://i.pinimg.com/736x/1c/1e/49/1c1e4913a3a7efb105728d7bedb04f58.jpg',
    'https://i.pinimg.com/736x/80/9d/b6/809db6d2b2090747547b8c131ca89cee.jpg',
    'https://i.pinimg.com/736x/15/86/45/15864584ee8a4df43c9c6e0c6487f047.jpg',
    'https://i.pinimg.com/736x/85/2b/31/852b3186291e6a9bb86bc03b29be9cf9.jpg',
    'https://i.pinimg.com/736x/3e/77/01/3e7701a02b4a4335ae505ff48da12b98.jpg',
    'https://i.pinimg.com/736x/36/2a/15/362a15d86cdc8122c7b302a05365e621.jpg',
    'https://i.pinimg.com/736x/2f/3d/bc/2f3dbc965a676fd546a24690b2265725.jpg',
    'https://i.pinimg.com/736x/6b/ef/59/6bef59dc506fb5a55e4985862893fa0c.jpg',
    'https://i.pinimg.com/736x/26/3f/c4/263fc4b260d46de342cfb12fa8843805.jpg',
    'https://i.pinimg.com/736x/f9/6c/59/f96c59fe34c7a101b9045570538fa09c.jpg',
    'https://i.pinimg.com/736x/1b/bc/85/1bbc8591d185a2e051acb03e9564b1a5.jpg',
    'https://i.pinimg.com/736x/a1/cf/c5/a1cfc58070c742c0b21cce1bfb6b190e.jpg',
    'https://i.pinimg.com/736x/a3/65/2d/a3652de483d53946c31c6185658b78d2.jpg',
    'https://i.pinimg.com/736x/9c/b3/c1/9cb3c137ffc098c311b25f97ece3397a.jpg',
    'https://i.pinimg.com/736x/ff/89/2d/ff892d07321e447b8ba940d8ab1a3fdb.jpg',
    'https://i.pinimg.com/736x/43/19/12/4319129394d0ac5646c82a41e9df51e9.jpg',
    'https://i.pinimg.com/736x/5a/f7/9b/5af79be13ab6aacd0d2e022d593bc873.jpg',
    'https://i.pinimg.com/736x/2b/36/af/2b36af5c7083879f05d5b21c695bd331.jpg',
    'https://i.pinimg.com/736x/a8/e4/a3/a8e4a336efe514a00643164c1f55e1b5.jpg',
    'https://i.pinimg.com/736x/1d/92/7f/1d927f21b4118d0306ca7ce6a2496079.jpg',
    'https://i.pinimg.com/736x/6d/b4/98/6db49822d3270efbfd6831a97627fd1c.jpg',
    'https://i.pinimg.com/736x/09/8b/65/098b65309ca43b7446912b0a268dd197.jpg',
    'https://i.pinimg.com/736x/40/14/31/401431970e85a33c5b083734179ba192.jpg',
    'https://i.pinimg.com/736x/03/56/6f/03566f103a7ec22688d3bc25c8e9b6f9.jpg',
    'https://i.pinimg.com/736x/e4/d7/4a/e4d74a0f3a90941b42850cab8ef8d6f3.jpg',
    'https://i.pinimg.com/736x/bf/c3/ff/bfc3ffac698e25c8b8da1cfc93a2cb7f.jpg',
    'https://i.pinimg.com/736x/84/ee/15/84ee1527cbca71f9f247bfb42ec5caaa.jpg',
    'https://i.pinimg.com/736x/af/fd/0e/affd0e498bf842c11288dfb3f875dbf3.jpg',
    'https://i.pinimg.com/736x/6a/0e/13/6a0e1300ca9f58411d5ce186c4698353.jpg',
    'https://i.pinimg.com/736x/1d/f6/a0/1df6a0c65ba011057e735c17fe09a670.jpg',
    'https://i.pinimg.com/736x/b4/e3/34/b4e33431fa44355a00d729f1c7dc4967.jpg',
    'https://i.pinimg.com/736x/be/53/11/be531169ac932fa693c57894b8fe266a.jpg',
    'https://i.pinimg.com/736x/82/74/1b/82741b00d19decfa1af4a6ab8cf8e216.jpg',
    'https://i.pinimg.com/736x/22/8d/e1/228de13952f70ff0dd4253b0d752cc5d.jpg',
    'https://i.pinimg.com/736x/01/c1/6f/01c16f4ceaa354489d068c27deaec416.jpg',
    'https://i.pinimg.com/736x/e6/f7/3e/e6f73e7ed3eae44bae5bb43b22c9c52b.jpg',
    'https://i.pinimg.com/736x/25/47/d8/2547d89d3cc3ec5907427c15fc2dbc6b.jpg',
    'https://i.pinimg.com/736x/25/70/f4/2570f4bb214d5364bce3b13d4152beeb.jpg',
    'https://i.pinimg.com/736x/04/db/42/04db42853ff9c89064cd35e869f9eb91.jpg',
    'https://i.pinimg.com/736x/e6/a6/9d/e6a69d2285bdc1be744a79f027b34c7a.jpg',
    'https://i.pinimg.com/736x/06/cc/21/06cc21a65cb3e9638375ca8624a8decd.jpg',
    'https://i.pinimg.com/736x/a6/a6/fe/a6a6fe5c3887174f9f76299ff28eb991.jpg',
    'https://i.pinimg.com/736x/0d/28/08/0d28089a467adb02acc0b38b7370699a.jpg',
    'https://i.pinimg.com/736x/10/70/d2/1070d2df1acfad6f6e6e27910d6f5760.jpg',
    'https://i.pinimg.com/736x/02/6b/21/026b2173c8b816b46c6d84023f748f86.jpg',
    'https://i.pinimg.com/736x/dd/24/e5/dd24e5416ac8414eaf4a03ad6901616e.jpg',
    'https://i.pinimg.com/736x/fd/d0/05/fdd005e9f5140205e8399abb3f2be2ef.jpg',
    'https://i.pinimg.com/736x/22/f4/f4/22f4f46896a7db6ca32b910d6c59834c.jpg',
    'https://i.pinimg.com/736x/c5/ec/86/c5ec86f6e6cfd32e35fc0277f7b96a6f.jpg',
    'https://i.pinimg.com/736x/96/d7/4a/96d74a563c556bbc18ec73886f03ef30.jpg',
    'https://i.pinimg.com/736x/07/55/58/075558effeda4fe5652862b095f19f65.jpg',
    'https://i.pinimg.com/736x/0a/72/39/0a72396cac852bdad778bc895e3d1544.jpg',
    'https://i.pinimg.com/736x/63/f7/61/63f761f77cf05828115f744343149506.jpg',
    'https://i.pinimg.com/736x/3b/a6/77/3ba677c100dd944a652d039121d26d42.jpg',
    'https://i.pinimg.com/736x/81/b5/12/81b51235ff8a3cc302e8e20c277af7cd.jpg',
    'https://i.pinimg.com/736x/9a/c7/67/9ac767da70c4849e188889f1548fc134.jpg',
    'https://i.pinimg.com/736x/22/6c/6b/226c6bb66f9d2565aa1166868474bfa0.jpg',
    'https://i.pinimg.com/736x/a3/86/b3/a386b390e3e5ac74cef3f60314813eed.jpg',
    'https://i.pinimg.com/736x/78/81/8d/78818dc0c242a4821e845bf5479ed144.jpg',
    'https://i.pinimg.com/736x/a9/d9/db/a9d9db7d678459301c73b7cd47eee4e5.jpg',
    'https://i.pinimg.com/736x/0a/21/f8/0a21f85a9f333a95b5613cabded38a96.jpg',
    'https://i.pinimg.com/736x/6a/f3/b4/6af3b479477a5bcaa714815447ee5cc3.jpg',
    'https://i.pinimg.com/736x/06/43/b3/0643b3f2e00d634fd6064d83b1531f6d.jpg',
    'https://i.pinimg.com/736x/22/8b/1c/228b1ca26726bc5f11271c358bf5b71a.jpg',
    'https://i.pinimg.com/736x/f9/4a/36/f94a366ed2637a6a3f49034fd80b59dd.jpg',
    'https://i.pinimg.com/736x/d5/ce/a2/d5cea2b5888ec4b1e48e5191e8668981.jpg',
    'https://i.pinimg.com/736x/55/5f/17/555f175b64aeb19f07c9c12344e768d0.jpg',
    'https://i.pinimg.com/736x/f7/b6/aa/f7b6aa062edc8ffdb61069033358a42b.jpg',
    'https://i.pinimg.com/736x/ae/5e/35/ae5e35035cccae513d85bc7a4c79e7f2.jpg',
    'https://i.pinimg.com/736x/b6/df/1e/b6df1e7384323d97af51daff361b6dad.jpg',
    'https://i.pinimg.com/736x/d0/6c/93/d06c93af216dea16fdbced6d39e12697.jpg',
    'https://i.pinimg.com/736x/4c/09/f4/4c09f451c888ba8083e47ec70c9bf472.jpg',
    'https://i.pinimg.com/736x/0e/9e/4b/0e9e4bfccbe59be4fe2b963168f5a5e5.jpg',
    'https://i.pinimg.com/736x/65/e2/71/65e2717a9b4870f3b78c460a7c9bc1a9.jpg',
    'https://i.pinimg.com/736x/56/36/5e/56365e0d08a5f8775dcc53d25a2f97bc.jpg',
    'https://i.pinimg.com/736x/61/5b/1a/615b1aac2d499f7c3c501b31a8fdcc0a.jpg',
    'https://i.pinimg.com/736x/77/1d/35/771d3541a9fa57854f2d4d77390a0c20.jpg',
    'https://i.pinimg.com/736x/bf/3c/b7/bf3cb7b05602345151e8f05117b0c73f.jpg',
    'https://i.pinimg.com/736x/f7/1e/90/f71e90e6da35ddb01ca4c325ef5ba840.jpg',
    'https://i.pinimg.com/736x/85/9b/72/859b72ba61b060b0fe83d53a787a490a.jpg',
    'https://i.pinimg.com/736x/bb/8d/d4/bb8dd42dc010aa4407144b759fb22406.jpg',
    'https://i.pinimg.com/736x/8c/2a/8e/8c2a8e837df20059c32e38a63097e543.jpg',
    'https://i.pinimg.com/736x/e9/e0/ed/e9e0eddb845c63687a9c5cb2298141f6.jpg',
    'https://i.pinimg.com/736x/e5/49/5f/e5495f4e993bdec685eb02b95357bc0e.jpg',
    'https://i.pinimg.com/736x/58/ce/f8/58cef8261b0d3ec9c07af101d90a54ce.jpg',
    'https://i.pinimg.com/736x/db/f4/52/dbf4525da5d41a2d2db10fd2fe4853c8.jpg',
    'https://i.pinimg.com/736x/0a/21/c8/0a21c803749fc15b2724c278d99e8932.jpg',
    'https://i.pinimg.com/736x/d5/fb/49/d5fb49ef1af2513213afbf4b28076029.jpg',
    'https://i.pinimg.com/736x/ac/89/74/ac89745744214df38e0dabdc36473688.jpg',
    'https://i.pinimg.com/736x/f4/c9/b2/f4c9b24db2d67bbc8b8a1300d05dff05.jpg',
    'https://i.pinimg.com/736x/74/6a/6f/746a6f085a9e42215a0ce17f3e9f7e68.jpg',
    'https://i.pinimg.com/736x/95/d5/47/95d547b7235481f733149e9fd3aefb99.jpg',
    'https://i.pinimg.com/736x/d8/f7/15/d8f71508fd3544808281973d2e70dcc7.jpg',
    'https://i.pinimg.com/736x/2c/d1/d0/2cd1d05f3286f55fd0c839697f44a6dc.jpg',
    'https://i.pinimg.com/736x/bf/56/40/bf5640188a74bcecffcd641444acff09.jpg',
    'https://i.pinimg.com/736x/4b/22/5d/4b225d66a289d3b20e4b993c5a580cef.jpg',
    'https://i.pinimg.com/736x/d5/7b/4e/d57b4ef251b4784b267b9d016c4c29d3.jpg',
    'https://i.pinimg.com/736x/5c/db/ed/5cdbed0e8baee74542e6103e3454b948.jpg',
    'https://i.pinimg.com/736x/51/a9/25/51a92549c39968ed872db708cd1e4784.jpg',
    'https://i.pinimg.com/736x/80/c5/5a/80c55abeb47c424b9b3f41e9975afc5f.jpg',
    'https://i.pinimg.com/736x/cc/2d/75/cc2d75aa024ce22841b99575377235ab.jpg',
    'https://i.pinimg.com/736x/2d/d3/83/2dd3835a2efd2d1fe9fc8a6da63a2f4c.jpg',
    'https://i.pinimg.com/736x/f7/ae/a2/f7aea292d10322f625ddb6b88276ab75.jpg',
    'https://i.pinimg.com/736x/c4/fa/15/c4fa15c3e497a55ea5d537a0e3557f24.jpg',
    'https://i.pinimg.com/736x/06/b5/0f/06b50feb34af91e5234d77d3ecb19aa5.jpg',
    'https://i.pinimg.com/736x/6e/1a/6e/6e1a6eeb7904d2eca976f9c71b53f80b.jpg',
    'https://i.pinimg.com/736x/1f/b1/76/1fb17698592f6084951676ca45806dfe.jpg',
    'https://i.pinimg.com/736x/6f/73/24/6f732474c8eceec1c01568f85f68267a.jpg',
    'https://i.pinimg.com/736x/dd/e2/94/dde2946694511303e62b34e9ddb0185e.jpg',
    'https://i.pinimg.com/736x/a1/e1/ab/a1e1ab711da22aa9ae3261cf9137c760.jpg',
    'https://i.pinimg.com/736x/09/ea/3b/09ea3bae941f8cd859c1920e702fa6ff.jpg',
    'https://i.pinimg.com/736x/d1/3b/3b/d13b3b83e1aab346280388102922c7b4.jpg',
    'https://i.pinimg.com/736x/96/d0/4b/96d04b6ef6e3a24e6034871697202406.jpg',
    'https://i.pinimg.com/736x/45/25/f0/4525f03b7083dcc84e40e827a2c5ed8d.jpg',
    'https://i.pinimg.com/736x/29/fc/db/29fcdbf19198dcf5388c4fa0e207e61f.jpg',
    'https://i.pinimg.com/736x/2c/45/b9/2c45b9f83c242c3949d5102521f63a65.jpg',
    'https://i.pinimg.com/736x/17/09/f3/1709f3baf3dd27beb9dfcd01b7f8e1c6.jpg',
    'https://i.pinimg.com/736x/22/ec/0f/22ec0f9dd60a04b2d1c33bf99a336bbd.jpg',
    'https://i.pinimg.com/736x/dc/71/a6/dc71a667d31e0e11f811c4894d43fee8.jpg',
    'https://i.pinimg.com/736x/fd/0c/9a/fd0c9addd52c94664ed086ae43136c7b.jpg',
    'https://i.pinimg.com/736x/fd/4e/b9/fd4eb99d4778eff6c6789f7bc6c4bd92.jpg',
    'https://i.pinimg.com/736x/e9/ac/10/e9ac10ae6a78ee2829ae8109803b5679.jpg',
    'https://i.pinimg.com/736x/50/fc/c8/50fcc83867f71cd5ab0850938bc17f44.jpg',
    'https://i.pinimg.com/736x/76/44/c7/7644c7eb91856dfa149efa236d36ebe2.jpg',
    'https://i.pinimg.com/736x/ca/41/a1/ca41a1d6c38b601b69424739cd62d0a0.jpg',
    'https://i.pinimg.com/736x/b5/3a/fb/b53afbcb942ed6040d1d38ced5d1aae4.jpg',
    'https://i.pinimg.com/736x/52/14/2f/52142fcfc4cdd887c173ca6f1f274c05.jpg',
  ],
  wealth: [
    'https://i.pinimg.com/736x/d6/9c/de/d69cdee2a586b1bd6829e8dd96d0de94.jpg',
    'https://i.pinimg.com/736x/b7/4e/df/b74edf0c5e8356231770c586e04cd219.jpg',
    'https://i.pinimg.com/736x/67/2f/91/672f911a12b61acbb869d56dbafa8782.jpg',
    'https://i.pinimg.com/736x/62/40/5c/62405ca0270c37a4e123c8d300f6b34c.jpg',
    'https://i.pinimg.com/736x/df/e0/df/dfe0df453b9131fd45b44a6a3a443d66.jpg',
    'https://i.pinimg.com/736x/6f/41/25/6f4125a7d228dff44fa2c9006d3cb373.jpg',
    'https://i.pinimg.com/736x/47/32/a2/4732a25f6da50f2e04b5d84a824f7936.jpg',
    'https://i.pinimg.com/736x/37/70/bf/3770bf9562caa11008d5d4726c0e640d.jpg',
    'https://i.pinimg.com/736x/2b/ab/63/2bab6375168f2eedca619dbd4a4a29b7.jpg',
    'https://i.pinimg.com/736x/c8/be/24/c8be24aebcfae9eded5516c8663b3c57.jpg',
    'https://i.pinimg.com/736x/f1/a3/f1/f1a3f1f5ed3cfdc85da40f2c843565a1.jpg',
    'https://i.pinimg.com/736x/be/5b/1b/be5b1b5334cd81bae4b51f108449eb05.jpg',
    'https://i.pinimg.com/736x/32/8c/08/328c08a9fa5dbf30e381e5a3cbfff34f.jpg',
    'https://i.pinimg.com/736x/47/d6/0d/47d60df3d653cb387dcba9476e08dcc2.jpg',
    'https://i.pinimg.com/736x/20/f6/59/20f6595883f431b7368ddd2ff751fa71.jpg',
    'https://i.pinimg.com/736x/79/0f/0d/790f0d6406598a7ba3111daf81ab2225.jpg',
    'https://i.pinimg.com/736x/aa/9c/dc/aa9cdcad30f65a24d61948db001323a6.jpg',
    'https://i.pinimg.com/736x/38/97/12/38971204aab96672707f2c03f3e2dc99.jpg',
    'https://i.pinimg.com/736x/6d/5a/30/6d5a30382cb116835ad00d16524406d0.jpg',
    'https://i.pinimg.com/736x/ea/4a/95/ea4a955476415c591d9f27b87243ff18.jpg',
    'https://i.pinimg.com/736x/4a/f9/22/4af922cbb2d51b073acafa644efffa14.jpg',
    'https://i.pinimg.com/736x/8c/9f/d2/8c9fd29ca53c6709af2a5678ed3609b2.jpg',
    'https://i.pinimg.com/736x/0d/23/2d/0d232ddac5144c3e957e5f8dd1d8c796.jpg',
    'https://i.pinimg.com/736x/2a/18/c5/2a18c5a08746c8c97210f719960d73af.jpg',
    'https://i.pinimg.com/736x/91/39/42/913942ab61a236710993f0e177466935.jpg',
    'https://i.pinimg.com/736x/d2/5c/c4/d25cc483a19e9cbf57883bf6c16b9639.jpg',
    'https://i.pinimg.com/736x/90/1a/5e/901a5ee5242c6f911e3e04d53c3d767b.jpg',
    'https://i.pinimg.com/736x/3e/1f/5d/3e1f5d6947d4126b3891aa0f019be529.jpg',
    'https://i.pinimg.com/736x/70/83/8b/70838b0d756a5daec1ea0aedde17b35d.jpg',
    'https://i.pinimg.com/736x/ef/30/00/ef3000e87539e27a6512eba03127663c.jpg',
    'https://i.pinimg.com/736x/9c/df/e3/9cdfe3e2069a2d9fef6e467487749e0e.jpg',
    'https://i.pinimg.com/736x/25/9d/22/259d22dfbe6708bc8c589606aea9f5d6.jpg',
    'https://i.pinimg.com/736x/c6/43/48/c64348cb517bfb520fc1c29ee2d8ff65.jpg',
    'https://i.pinimg.com/736x/e6/27/18/e6271822969aa30de6ccc9d877acb3d0.jpg',
    'https://i.pinimg.com/736x/62/a7/68/62a768b83edbe1c758d82c2d909fa607.jpg',
    'https://i.pinimg.com/736x/de/83/05/de8305a1275624e4b6a2164bca66366d.jpg',
    'https://i.pinimg.com/736x/c2/a0/d7/c2a0d7ac0619860b30c1fba0cb5355bd.jpg',
    'https://i.pinimg.com/736x/46/73/8d/46738d93c761159d79e45bf6f7e5f240.jpg',
    'https://i.pinimg.com/736x/86/1d/91/861d91c87dc9ba94eae7792959549aec.jpg',
    'https://i.pinimg.com/736x/2f/27/cd/2f27cdf82d17a26cb688e702eff2db36.jpg',
    'https://i.pinimg.com/736x/a0/c4/4f/a0c44f1fb732cdf00679952704debbc0.jpg',
    'https://i.pinimg.com/736x/b3/3d/1e/b33d1e8cafc2a2c328994eeac6011b7f.jpg',
    'https://i.pinimg.com/736x/cc/0e/0a/cc0e0aaad07ae0264a40d427a6d33149.jpg',
    'https://i.pinimg.com/736x/78/b0/19/78b019515d35e2c836596daf97008156.jpg',
    'https://i.pinimg.com/736x/87/73/67/8773673f593af51148daef73471ebb24.jpg',
    'https://i.pinimg.com/736x/9b/4a/af/9b4aaf71fff7ecf0ab10d5ff45ae0598.jpg',
    'https://i.pinimg.com/736x/26/b9/fc/26b9fcd7336591161b332ba06fae94a0.jpg',
    'https://i.pinimg.com/736x/18/23/1c/18231c891c535e37e75f834833e4dfe5.jpg',
    'https://i.pinimg.com/736x/43/fe/dc/43fedc13f54322cfef726a0457f4c159.jpg',
    'https://i.pinimg.com/736x/92/83/8c/92838ccefc9d4a00e0ca80a9ef1837a2.jpg',
    'https://i.pinimg.com/736x/c8/17/0f/c8170f74fbeca630b3aa585dcb1f27b0.jpg',
    'https://i.pinimg.com/736x/68/04/57/680457d1f74a353b13c64ef2c3c3edad.jpg',
    'https://i.pinimg.com/736x/d2/64/5f/d2645fb64aa8016977e97b37f6e46cbf.jpg',
    'https://i.pinimg.com/736x/31/af/6f/31af6f9e51b46985eb56999b9deb0918.jpg',
    'https://i.pinimg.com/736x/fe/0d/5e/fe0d5ea5890f8e6e545ec5242564301d.jpg',
    'https://i.pinimg.com/736x/20/3b/6e/203b6e7227c48ae388f5440c15fe6503.jpg',
    'https://i.pinimg.com/736x/ee/49/59/ee4959cd3adfa332bb8e2e8e9c9a0af8.jpg',
    'https://i.pinimg.com/736x/36/96/e9/3696e9b6eba39e9a7c35f83848d9d0e2.jpg',
    'https://i.pinimg.com/736x/bf/c8/b3/bfc8b3d691e5350948cdc95e7a736086.jpg',
    'https://i.pinimg.com/736x/28/80/fd/2880fdedd9d887969a0fa086b5bbb62c.jpg',
    'https://i.pinimg.com/736x/86/77/3b/86773b087ca6504ad3e13bfda3c34dd2.jpg',
    'https://i.pinimg.com/736x/30/82/67/308267ec3bae72e05f8a8f92e0d5f14e.jpg',
    'https://i.pinimg.com/736x/78/57/85/785785a7765a118d37a70716c1c5a950.jpg',
    'https://i.pinimg.com/736x/9f/86/d7/9f86d78cda74c297fa31a21b0f23837e.jpg',
    'https://i.pinimg.com/736x/3a/6d/c9/3a6dc9bd165e86f178f2db29c92e6fe0.jpg',
    'https://i.pinimg.com/736x/ad/b7/b0/adb7b05e2236b20cd80b3f19f7535902.jpg',
    'https://i.pinimg.com/736x/df/43/72/df4372fe71daad29b9f23222ac4b98de.jpg',
    'https://i.pinimg.com/736x/50/08/ef/5008efac4c51556dc14d2741a6a1c7ae.jpg',
    'https://i.pinimg.com/736x/51/4d/39/514d39ef989ae6c40d4e67d47d3d42a3.jpg',
    'https://i.pinimg.com/736x/ee/a1/49/eea149896b061c75423b31d49e603bd7.jpg',
    'https://i.pinimg.com/736x/7c/f6/ef/7cf6ef82806041fec9e21c98a555a3a0.jpg',
    'https://i.pinimg.com/736x/b8/15/f6/b815f6be7edc8c75a42e4cc6dd1c556e.jpg',
    'https://i.pinimg.com/736x/3e/24/7e/3e247e25113583ad9d344f56ddbac100.jpg',
    'https://i.pinimg.com/736x/db/e0/ae/dbe0ae4cb97dea2e879fc9b6d353fc92.jpg',
    'https://i.pinimg.com/736x/d5/8f/2a/d58f2ad945b524473c3a39b54c580192.jpg',
    'https://i.pinimg.com/736x/32/5b/d9/325bd9b033d719a8634f65e37dd45046.jpg',
    'https://i.pinimg.com/736x/c5/b9/6d/c5b96dc36730f7a82de478b46459f5a0.jpg',
    'https://i.pinimg.com/736x/e4/73/3f/e4733f6f15d33ee22b41fa9820fb1762.jpg',
    'https://i.pinimg.com/736x/a6/c2/0b/a6c20b69d56ac3b6ad2fa617a6743144.jpg',
    'https://i.pinimg.com/736x/25/3a/25/253a2540918c29878eb16608aa384a2e.jpg',
    'https://i.pinimg.com/736x/7b/b9/d6/7bb9d6f1a232e294dcf1d21108d93b61.jpg',
    'https://i.pinimg.com/736x/53/b4/79/53b4795234dab5935d5393fbbbbaf68f.jpg',
    'https://i.pinimg.com/736x/65/a6/50/65a650bd451b2d083b5a33ccf302948d.jpg',
    'https://i.pinimg.com/736x/09/4e/d3/094ed338d0b63542aa90c275c6bd178d.jpg',
    'https://i.pinimg.com/736x/6a/7c/f9/6a7cf9772b17813a546142b9a97168a0.jpg',
    'https://i.pinimg.com/736x/63/24/13/6324133289d0f9f3a69a7715923f7049.jpg',
    'https://i.pinimg.com/736x/18/93/97/189397086dc70cd4efb44c5a07502385.jpg',
    'https://i.pinimg.com/736x/33/74/e7/3374e73a2e8c6e025893a30c8582cb6f.jpg',
    'https://i.pinimg.com/736x/cd/ff/0b/cdff0bfb4544e237333a265c3306a66e.jpg',
    'https://i.pinimg.com/736x/b1/57/ff/b157ffa91530ea996a575c0bd425abd9.jpg',
    'https://i.pinimg.com/736x/1f/dd/e9/1fdde918c6f91ed4e3da045e50a99508.jpg',
    'https://i.pinimg.com/736x/23/61/94/23619497772323cc021d25ea91f6f0f6.jpg',
    'https://i.pinimg.com/736x/1f/46/73/1f4673562e547b9cf0e42c536f64670b.jpg',
    'https://i.pinimg.com/736x/61/86/1a/61861a6f753b983c97bac602887e029a.jpg',
    'https://i.pinimg.com/736x/35/37/ee/3537eeb97eb826cc3e320d9c5d50eef4.jpg',
    'https://i.pinimg.com/736x/fe/1d/2b/fe1d2b078523dd1a9ece6db61a980de8.jpg',
    'https://i.pinimg.com/736x/89/ac/f8/89acf8f40453e5d28e37858ff1c6ff44.jpg',
    'https://i.pinimg.com/736x/18/de/f6/18def65b641eff32206f710c3c1a9277.jpg',
    'https://i.pinimg.com/736x/c5/c4/8e/c5c48edc2909e54c6941ebb6793c08f8.jpg',
    'https://i.pinimg.com/736x/ad/23/00/ad2300d4e6640ffa84d05636627a3634.jpg',
    'https://i.pinimg.com/736x/f9/0b/b6/f90bb658214329ec6a4f1412e0fdd434.jpg',
    'https://i.pinimg.com/736x/06/24/1e/06241ebf570c86a0a0fed33dc0dc5935.jpg',
    'https://i.pinimg.com/736x/6d/16/01/6d16017dc2ab7fbb38b52035d32c9f05.jpg',
    'https://i.pinimg.com/736x/ca/58/59/ca5859a9b9c6f503f5976dc84046ec23.jpg',
    'https://i.pinimg.com/736x/2c/b0/9a/2cb09a34d884194113ec32b8a222448d.jpg',
    'https://i.pinimg.com/736x/a6/60/23/a6602309799cf32c65b55423a3da2658.jpg',
    'https://i.pinimg.com/736x/94/00/f3/9400f354f5bf0e3bb973d49479f4b2e1.jpg',
    'https://i.pinimg.com/736x/d0/30/9c/d0309ca7ab0252653b0cc5dd34a2502e.jpg',
    'https://i.pinimg.com/736x/8d/a0/63/8da06345457970e9eb5445608d4edc4e.jpg',
    'https://i.pinimg.com/736x/dd/7a/a9/dd7aa9c8c2a3aab8a63a2bf9dc556f92.jpg',
    'https://i.pinimg.com/736x/43/e2/b7/43e2b72153cd7e988fb20e1146181f80.jpg',
    'https://i.pinimg.com/736x/4b/a3/ca/4ba3cae9817e0d1d425101a41afc73d3.jpg',
    'https://i.pinimg.com/736x/4f/7e/15/4f7e15058c0084a7fe82364fe2b69923.jpg',
    'https://i.pinimg.com/736x/60/7b/90/607b908966a4c2939f353e00826418fd.jpg',
    'https://i.pinimg.com/736x/6f/d0/70/6fd070acfb756f5c77a6a0df51570734.jpg',
    'https://i.pinimg.com/736x/76/54/aa/7654aa26106b099a6bb121f8738613c4.jpg',
    'https://i.pinimg.com/736x/7a/7b/a8/7a7ba8844795a6aeb7a2f25080f5aa3d.jpg',
    'https://i.pinimg.com/736x/7b/0c/ce/7b0cce2ac4ad9155d2d5409f45ebae6b.jpg',
    'https://i.pinimg.com/736x/88/fb/8c/88fb8ca116c9585300a11491aee5887d.jpg',
    'https://i.pinimg.com/736x/8b/6f/ee/8b6feed4bee276f6e50f17ff4045f682.jpg',
    'https://i.pinimg.com/736x/93/32/05/93320585457f90220aa572d45417c533.jpg',
    'https://i.pinimg.com/736x/93/e2/aa/93e2aa0af7f1d823c8dd0b69b8db8cab.jpg',
    'https://i.pinimg.com/736x/95/e2/5e/95e25e5cc08dbfac4181e8bb5b6c9b3a.jpg',
    'https://i.pinimg.com/736x/a3/6f/58/a36f58cc419eaa0cee09acdfc5d8f4c5.jpg',
    'https://i.pinimg.com/736x/a3/80/24/a380243fbf6e0ec52fb1c6a2a9b3e706.jpg',
    'https://i.pinimg.com/736x/a4/9a/47/a49a47ec51004eb30c52685583609c88.jpg',
    'https://i.pinimg.com/736x/b4/c9/8c/b4c98c7ed194b2a217113a504ed9f812.jpg',
    'https://i.pinimg.com/736x/cd/b8/2c/cdb82c83e427c9fa1eb8cede633ddc0e.jpg',
    'https://i.pinimg.com/736x/d0/e8/9e/d0e89ec79b26d8c110df54e6e334ae3b.jpg',
    'https://i.pinimg.com/736x/f3/a0/76/f3a0763585be99c92c080a915b6a5b0b.jpg',
    'https://i.pinimg.com/736x/ff/d9/a2/ffd9a2421fe1b111d6357fd992805416.jpg',
    'https://i.pinimg.com/736x/90/d4/01/90d401445bccdcd6815dde2f56e26265.jpg',
    'https://i.pinimg.com/736x/82/f8/46/82f84686d0f6f246b1f87934df6bae41.jpg',
    'https://i.pinimg.com/736x/2b/3b/91/2b3b9144aa828e699ed3b78ef871fdad.jpg',
    'https://i.pinimg.com/736x/b0/65/1e/b0651edb0561abee1a6dc58ca937d2ae.jpg',
    'https://i.pinimg.com/736x/e4/b9/08/e4b908d0686177fca33853ce88a17e1c.jpg',
    'https://i.pinimg.com/736x/e6/09/92/e609922977fbaf675ccd76146a8c8267.jpg',
    'https://i.pinimg.com/736x/62/ff/18/62ff1845521dd8caac8126fff9e5c180.jpg',
    'https://i.pinimg.com/736x/86/4d/e0/864de0376242b7d0a636af040c4ceee9.jpg',
    'https://i.pinimg.com/736x/21/ce/49/21ce499b1c4378559cb858e6fa2f0c1f.jpg',
    'https://i.pinimg.com/736x/c0/94/a3/c094a3467c76e1e6ee0b9ea584d8e117.jpg',
    'https://i.pinimg.com/736x/68/7c/ba/687cbafdd8a3b73f3e9f0c3398a5521c.jpg',
    'https://i.pinimg.com/736x/f3/d3/46/f3d346a72cb8cf4ee981f0cc0197d142.jpg',
    'https://i.pinimg.com/736x/e5/ea/02/e5ea0231ca0c8b9444ef4c5a1a511344.jpg',
    'https://i.pinimg.com/736x/23/22/75/2322758f27bb3c0090cbd72785032e46.jpg',
    'https://i.pinimg.com/736x/92/8f/d1/928fd1d7b8310db01cd8e05f9e1aab9e.jpg',
    'https://i.pinimg.com/736x/23/0b/79/230b790db0bdb3657b4a1689de3a972a.jpg',
    'https://i.pinimg.com/736x/fa/55/f0/fa55f0992aae7c961345236e6349316a.jpg',
    'https://i.pinimg.com/736x/be/f6/50/bef65061b961474d9e4d1b6efdbb8f11.jpg',
    'https://i.pinimg.com/736x/f3/1d/7c/f31d7c6dc35335a6f0f01904250121e9.jpg',
    'https://i.pinimg.com/736x/d3/fe/bf/d3febf8c2dd34658cdbab5c8bdbc6a31.jpg',
    'https://i.pinimg.com/736x/4b/45/3d/4b453d1f50349fb9b8c1f23c623e4756.jpg',
    'https://i.pinimg.com/736x/e7/56/41/e756410b57918fe886a9e07b8921159a.jpg',
    'https://i.pinimg.com/736x/06/e6/c3/06e6c3ad71a242ae959fc124f1a47983.jpg',
    'https://i.pinimg.com/736x/21/b9/91/21b991cb0a1f2090a8626e75023eca9b.jpg',
    'https://i.pinimg.com/736x/04/b7/6a/04b76acf648be91ccb8d1cc7dc9674db.jpg',
    'https://i.pinimg.com/736x/e8/31/ff/e831ff366c4035a7849937d218209936.jpg',
    'https://i.pinimg.com/736x/08/de/ed/08deedb50665634f181128b87281b965.jpg',
    'https://i.pinimg.com/736x/be/f7/b2/bef7b2e127980cfdf0e41f9c21322411.jpg',
    'https://i.pinimg.com/736x/0c/ea/82/0cea82b93f03fdf778b5d0d3365da5f6.jpg',
    'https://i.pinimg.com/736x/f2/08/27/f208276b60715406d39b9054624445c7.jpg',
    'https://i.pinimg.com/736x/4c/a6/8c/4ca68c542ded7ba25e5af88c8f5f3989.jpg',
    'https://i.pinimg.com/736x/42/8d/d6/428dd6098c3b2402150ad2820fae354f.jpg',
    'https://i.pinimg.com/736x/e3/93/62/e39362ee969476cdd0cfd4a1f11673b5.jpg',
    'https://i.pinimg.com/736x/dd/24/f6/dd24f63af6e4c0d482cfeb91f22848f7.jpg',
    'https://i.pinimg.com/736x/3b/07/14/3b0714569358c2d4c3585b3c7aaf7223.jpg',
    'https://i.pinimg.com/736x/b7/3d/f5/b73df585e04622abcd8cbfbe0f9808fc.jpg',
    'https://i.pinimg.com/736x/e0/de/bb/e0debb5bc4d467ac2bc85d9420c75449.jpg',
    'https://i.pinimg.com/736x/80/f2/70/80f270216a7fb5d52e4d2fea1713e3a2.jpg',
    'https://i.pinimg.com/736x/6f/f5/10/6ff5106660a42be176adb33ac5d019ad.jpg',
    'https://i.pinimg.com/736x/9d/74/b6/9d74b625047914da7034213310314e71.jpg',
  ],
  affiliate: [
    'https://i.pinimg.com/736x/33/fe/f3/33fef3709ff821fa98efae352b9045e2.jpg',
    'https://i.pinimg.com/736x/89/70/a5/8970a56dfa8519255664fd90d2689d8f.jpg',
    'https://i.pinimg.com/736x/4b/3d/df/4b3ddf6dad66256537d8367dff573bfc.jpg',
    'https://i.pinimg.com/736x/09/ec/ab/09ecababccdf412a196367303f9ab73f.jpg',
    'https://i.pinimg.com/736x/68/19/e4/6819e4f6f471d35bddb189ae5074d77a.jpg',
    'https://i.pinimg.com/736x/4f/7e/15/4f7e15058c0084a7fe82364fe2b69923.jpg',
    'https://i.pinimg.com/736x/f6/75/76/f67576e197e9141d445c079ac025ad45.jpg',
    'https://i.pinimg.com/736x/a9/87/cf/a987cfd6fb11f05708d64d01d3891154.jpg',
    'https://i.pinimg.com/736x/c8/78/5d/c8785d92582a403453b2b6a26fd0e511.jpg',
    'https://i.pinimg.com/736x/a8/f8/f3/a8f8f3b4c59c127bde3fe8aea5332bc1.jpg',
    'https://i.pinimg.com/736x/ab/07/c6/ab07c62dbd7cf481760ba65a4d2f6383.jpg',
    'https://i.pinimg.com/736x/ff/d9/a2/ffd9a2421fe1b111d6357fd992805416.jpg',
    'https://i.pinimg.com/736x/83/44/3f/83443f99f4d7c772161db0fa45638b1d.jpg',
    'https://i.pinimg.com/736x/c4/dc/8d/c4dc8d44ac9edc6bef0c33cdcce66a56.jpg',
    'https://i.pinimg.com/736x/ee/bb/7a/eebb7a6435373bac0af76d7bc5e19f33.jpg',
    'https://i.pinimg.com/736x/59/07/b3/5907b317fc967581d0a9445fa4532c68.jpg',
    'https://i.pinimg.com/736x/3c/43/1f/3c431f6687b46100c755299e4faa7178.jpg',
    'https://i.pinimg.com/736x/34/2b/d7/342bd716179c775ec26fc9f15b4ed2e2.jpg',
    'https://i.pinimg.com/736x/93/e2/aa/93e2aa0af7f1d823c8dd0b69b8db8cab.jpg',
    'https://i.pinimg.com/736x/11/a2/e6/11a2e621375a3ad9ec4e83f334773b21.jpg',
    'https://i.pinimg.com/736x/be/5b/7f/be5b7fc6d7c9eeab179f2b9fbd744636.jpg',
    'https://i.pinimg.com/736x/d7/b3/6a/d7b36a2391ae84dd482949ddef47dd09.jpg',
    'https://i.pinimg.com/736x/4c/ee/56/4cee569d8c748a8266b10deaa21e3ccc.jpg',
    'https://i.pinimg.com/736x/17/19/14/17191496c72ac6cd39f715710bd55857.jpg',
    'https://i.pinimg.com/736x/63/f1/7a/63f17ad64e414d69f412817e692a7db7.jpg',
    'https://i.pinimg.com/736x/15/ac/bf/15acbf87a1081be5d558e3bd2bc4def8.jpg',
    'https://i.pinimg.com/736x/6a/69/2d/6a692dea100aa62af042eca6a0368785.jpg',
    'https://i.pinimg.com/736x/14/0d/b5/140db50a2312d5a2b1ecb211dce433f6.jpg',
    'https://i.pinimg.com/736x/0a/0e/81/0a0e81b77bcf2808e5385673f2a9831f.jpg',
    'https://i.pinimg.com/736x/a6/71/7b/a6717b7a0adee132980cb67939d1b8d9.jpg',
    'https://i.pinimg.com/736x/51/14/1a/51141a9a36efc52f00b6642eb5df909a.jpg',
    'https://i.pinimg.com/736x/52/13/40/521340dee27c6f0f4b491e2bcf5ae117.jpg',
    'https://i.pinimg.com/736x/fb/91/19/fb9119d8f7aae44ca2e5deea61c020d1.jpg',
    'https://i.pinimg.com/736x/5e/5c/12/5e5c12e5ce2bc543e59dffbd1cb11c27.jpg',
    'https://i.pinimg.com/736x/f5/21/b6/f521b6cc583d8233faae4d1e3f6d54e5.jpg',
    'https://i.pinimg.com/736x/76/94/cf/7694cffd9532b3f3089b42c48cfee239.jpg',
    'https://i.pinimg.com/736x/8c/44/f8/8c44f806630d675e8716d40805832d16.jpg',
    'https://i.pinimg.com/736x/39/53/27/395327b60382825fee28ddb04a12376c.jpg',
    'https://i.pinimg.com/736x/a0/79/c5/a079c57d4d938cefc0463255a66c4aae.jpg',
    'https://i.pinimg.com/736x/cb/5c/4b/cb5c4bb9e92e636324d3470ad6d1b92b.jpg',
    'https://i.pinimg.com/736x/1f/3c/74/1f3c749d0a70cbc971c35755cb821181.jpg',
    'https://i.pinimg.com/736x/5b/d1/4a/5bd14a710b973e471a33cfd521c3654b.jpg',
    'https://i.pinimg.com/736x/1a/8f/8f/1a8f8f743ca143cebfb101e5be4db703.jpg',
    'https://i.pinimg.com/736x/d0/30/9c/d0309ca7ab0252653b0cc5dd34a2502e.jpg',
    'https://i.pinimg.com/736x/af/87/df/af87dfd0b97cf1a1a8bca489f7a37395.jpg',
    'https://i.pinimg.com/736x/87/69/8c/87698cc52b6015c7edccd56a42278c80.jpg',
    'https://i.pinimg.com/736x/fb/98/5e/fb985e5a26a5b159122d471d2870de0e.jpg',
    'https://i.pinimg.com/736x/23/1b/e7/231be75b2384e78c0e9866f118cabc14.jpg',
    'https://i.pinimg.com/736x/cf/f0/5e/cff05e67997d8ac9190d2dce0c214e97.jpg',
    'https://i.pinimg.com/736x/f0/32/5b/f0325b802dc4d06bfa445c9c2775de89.jpg',
    'https://i.pinimg.com/736x/76/dd/81/76dd817c0c55de57191086d93603eb26.jpg',
    'https://i.pinimg.com/736x/98/8b/d0/988bd0e56300be1cae23faa549e1f2f6.jpg',
    'https://i.pinimg.com/736x/61/eb/8d/61eb8dda575899eca5962feaeda9ca03.jpg',
    'https://i.pinimg.com/736x/55/d4/76/55d476c217482ddc55b7b261ee462358.jpg',
    'https://i.pinimg.com/736x/53/e0/55/53e05563d2c76873d19c551fcd244d74.jpg',
    'https://i.pinimg.com/736x/08/c4/38/08c4380a729da55ae959cc170967a797.jpg',
    'https://i.pinimg.com/736x/ca/54/69/ca5469cd1edf31569f2dca9ad01c8746.jpg',
    'https://i.pinimg.com/736x/ce/e2/57/cee257bdc8852b5530691716a3a0185c.jpg',
    'https://i.pinimg.com/736x/a6/ba/1a/a6ba1a68a5d2e1605e5f04a75dcdd369.jpg',
    'https://i.pinimg.com/736x/6a/e0/40/6ae04034e8c53cc59edd566a8c346ea9.jpg',
    'https://i.pinimg.com/736x/81/89/eb/8189ebc8838c4d49911795c758d23538.jpg',
    'https://i.pinimg.com/736x/2c/1b/a6/2c1ba6d47f4a494321d1e61cd1122b38.jpg',
    'https://i.pinimg.com/736x/f3/78/ad/f378ad3b982a170598c19c5a5ea3b7d3.jpg',
    'https://i.pinimg.com/736x/2f/68/a0/2f68a0906f18c27ccc55bee91f33aa28.jpg',
    'https://i.pinimg.com/736x/4b/45/29/4b45298a0dcc56100574b5e314d76c02.jpg',
    'https://i.pinimg.com/736x/d1/a7/d6/d1a7d61cfd2f5ae804900af51581f41d.jpg',
    'https://i.pinimg.com/736x/05/44/72/054472324aba1328c1a8c372a68d952f.jpg',
    'https://i.pinimg.com/736x/2c/25/6f/2c256fbb31bd12a3ebfb5889c108c6d5.jpg',
    'https://i.pinimg.com/736x/8b/a5/95/8ba595594d7eb15999fe22bf06cf45b9.jpg',
    'https://i.pinimg.com/736x/b3/e9/b8/b3e9b82ba6f0eef47f9fa1aa49f4d497.jpg',
    'https://i.pinimg.com/736x/c9/dd/c5/c9ddc5d2bf2128d71f26f85f48e64bfa.jpg',
    'https://i.pinimg.com/736x/6e/23/6c/6e236c61972561ec630f63d216f2eda4.jpg',
    'https://i.pinimg.com/736x/1b/b1/5a/1bb15ab6d44a138b3d267f7f1abfcccb.jpg',
    'https://i.pinimg.com/736x/bb/ab/e0/bbabe024cc356c683fb79435e892498d.jpg',
    'https://i.pinimg.com/736x/f7/4b/02/f74b0236fdcc3045f439526d67cd1dea.jpg',
    'https://i.pinimg.com/736x/c5/1e/1a/c51e1af7d7200dc0bb4af3b675baac9c.jpg',
    'https://i.pinimg.com/736x/48/70/73/487073faa4914412410efbb6a77f9e2b.jpg',
    'https://i.pinimg.com/736x/c7/f4/96/c7f49696b3b2aa255e89061ced31ad0d.jpg',
    'https://i.pinimg.com/736x/02/14/ed/0214ed7dd712e0bd98656287da68ff1e.jpg',
    'https://i.pinimg.com/736x/0c/cb/fc/0ccbfc9b7bfff264315141824bd93100.jpg',
    'https://i.pinimg.com/736x/01/a9/44/01a944f1ebf771665ef7ad3b68a21d83.jpg',
    'https://i.pinimg.com/736x/72/c9/ba/72c9bad98121a4325e29e989128ef632.jpg',
    'https://i.pinimg.com/736x/2c/93/07/2c9307f2d4e1445789c28a959954dc32.jpg',
    'https://i.pinimg.com/736x/a6/c5/ed/a6c5edfaf3f432cd7a10a2d669998944.jpg',
    'https://i.pinimg.com/736x/02/d0/e9/02d0e90b6986df912d61acb47b891e1f.jpg',
    'https://i.pinimg.com/736x/bd/32/d9/bd32d9ac9fcfa7b7ff9a57c4e26606c5.jpg',
    'https://i.pinimg.com/736x/19/c1/b7/19c1b77331cfbde5d8acf1ccf01f8f75.jpg',
    'https://i.pinimg.com/736x/a7/60/b1/a760b14daa3353136d496078650b6f96.jpg',
    'https://i.pinimg.com/736x/f6/3c/13/f63c1330edbeda736e69b6441aba7080.jpg',
    'https://i.pinimg.com/736x/5a/2e/70/5a2e70c334b42b6abf57ec32c2d72744.jpg',
    'https://i.pinimg.com/736x/54/b5/d2/54b5d293b36d24b118fdce17b47247aa.jpg',
    'https://i.pinimg.com/736x/9d/35/6c/9d356cf40b0cf6fcfb1e3343e3bf288b.jpg',
    'https://i.pinimg.com/736x/f9/19/1c/f9191c5901c00b9edadca4fdf516c4ef.jpg',
    'https://i.pinimg.com/736x/73/79/ab/7379ab90a3ef6122b21521a56d76b8c7.jpg',
    'https://i.pinimg.com/736x/7a/d2/3b/7ad23b8184ce659adf78c098db40faa6.jpg',
    'https://i.pinimg.com/736x/b8/be/25/b8be25205850af3c53980bd622ee1210.jpg',
    'https://i.pinimg.com/736x/ca/f1/19/caf11934ba4240b0acc2f40aa1289315.jpg',
    'https://i.pinimg.com/736x/37/c5/d0/37c5d059546aa865f72a5c8f5074ce3e.jpg',
    'https://i.pinimg.com/736x/80/d1/a3/80d1a3b49f11c532e45129f6b7871e07.jpg',
    'https://i.pinimg.com/736x/4b/94/5f/4b945f6eaca4f0c722e81641b758ad76.jpg',
    'https://i.pinimg.com/736x/9f/13/39/9f1339b293b2eaae38c2eee804d96cde.jpg',
    'https://i.pinimg.com/736x/4e/fd/54/4efd5458fcd997d03d3db292cbec3e4e.jpg',
    'https://i.pinimg.com/736x/2f/2e/e7/2f2ee70557eb94847bb0d221bf3b665a.jpg',
    'https://i.pinimg.com/736x/b5/89/20/b58920a548fe5c83c8f07e1384f30e25.jpg',
    'https://i.pinimg.com/736x/f4/3a/8a/f43a8abc231eed3fb679294e4a346065.jpg',
    'https://i.pinimg.com/736x/39/1b/ff/391bffc7aa15186589e9ed5d316c8f2c.jpg',
    'https://i.pinimg.com/736x/3b/d4/aa/3bd4aa4967fa08bfa1c8a3aafe05a84b.jpg',
    'https://i.pinimg.com/736x/48/5f/47/485f474f0fb73ea97695df6f43d0cedd.jpg',
    'https://i.pinimg.com/736x/5d/cc/b7/5dccb711d4b73c6b11c943856693fe52.jpg',
    'https://i.pinimg.com/736x/50/29/57/50295714fed1cf4ecfe02ecfad92ea28.jpg',
    'https://i.pinimg.com/736x/72/2d/16/722d16c1a4088bb4e0721fb3ac1e5999.jpg',
    'https://i.pinimg.com/736x/5d/4f/61/5d4f61150686c795d6b43c18fb1efeeb.jpg',
    'https://i.pinimg.com/736x/bd/bb/fc/bdbbfc4f89802f6c8d54450110cbfa63.jpg',
    'https://i.pinimg.com/736x/05/6e/47/056e4771fbfd7172aad633e4ef43c41a.jpg',
    'https://i.pinimg.com/736x/4f/dc/2d/4fdc2d0be53672d5a6b9460653a8dfdc.jpg',
    'https://i.pinimg.com/736x/ac/bc/f9/acbcf934ef726b81da1670bc2ce877a4.jpg',
    'https://i.pinimg.com/736x/0a/82/0d/0a820d9ede3f9760d0978b60a3352f03.jpg',
    'https://i.pinimg.com/736x/29/b5/ab/29b5abb9574c5f5c69438ba9ebcccea2.jpg',
    'https://i.pinimg.com/736x/86/fc/c2/86fcc2d1bda378fb33537dd77b2463cc.jpg',
    'https://i.pinimg.com/736x/f8/71/de/f871de1988f326fb9f8faf9f8940fe92.jpg',
    'https://i.pinimg.com/736x/7a/86/82/7a86827ba97e6e4d2c9283dd2803b610.jpg',
    'https://i.pinimg.com/736x/73/ff/a3/73ffa3cab5655ab5213f2b6406fba28d.jpg',
    'https://i.pinimg.com/736x/6b/c5/0f/6bc50fab96adbf3ff1c60df1c099930d.jpg',
    'https://i.pinimg.com/736x/42/81/82/4281826682c31e8d85ee4ccfca4ef8d7.jpg',
    'https://i.pinimg.com/736x/92/d9/c7/92d9c7a4e9dd1639e71def2d608f6cab.jpg',
    'https://i.pinimg.com/736x/d8/1c/bd/d81cbdd632e892718a9b631774b6b1d6.jpg',
    'https://i.pinimg.com/736x/2c/2e/4e/2c2e4efb75aff237705bc21b98d93ebb.jpg',
    'https://i.pinimg.com/736x/cf/27/81/cf278172033f07b929ac3c5d0957ff70.jpg',
    'https://i.pinimg.com/736x/f4/d5/f0/f4d5f01e11627da9d86c6b8b3be7b8ae.jpg',
    'https://i.pinimg.com/736x/93/01/fe/9301fe4f4d008d1cd0db3e9a8bc8be38.jpg',
    'https://i.pinimg.com/736x/0e/5f/be/0e5fbe556fb5551176e8565ab18a6f0b.jpg',
    'https://i.pinimg.com/736x/bc/fd/88/bcfd88389bad584451288e9f6a6befec.jpg',
    'https://i.pinimg.com/736x/4e/db/d5/4edbd5fd5ecfab2bf8e3b260364cb837.jpg',
    'https://i.pinimg.com/736x/94/70/9a/94709af0d567839785331b642a36d3ce.jpg',
    'https://i.pinimg.com/736x/ea/2a/24/ea2a24f95805c87e1cd5bed610c6f245.jpg',
    'https://i.pinimg.com/736x/a4/c8/9b/a4c89b35c10fdbd438f2ecbe55e24a9c.jpg',
    'https://i.pinimg.com/736x/62/8e/5b/628e5bdcdb4ebbde779784e2946f6247.jpg',
    'https://i.pinimg.com/736x/8c/5b/c1/8c5bc1158fff6ffb06804994855fecef.jpg',
    'https://i.pinimg.com/736x/63/62/14/636214fe2b9551b1b5cb9547e4216900.jpg',
    'https://i.pinimg.com/736x/8f/e2/05/8fe205681a20b9d43f511f4cbd1b7c1e.jpg',
    'https://i.pinimg.com/736x/94/52/02/94520296133ea027497b9a8caeac826f.jpg',
    'https://i.pinimg.com/736x/28/03/b3/2803b3e1b928320315113ec488937422.jpg',
    'https://i.pinimg.com/736x/ac/d1/f0/acd1f0fa5f7dd7731fa556f9934ce5fe.jpg',
    'https://i.pinimg.com/736x/60/f7/fe/60f7fe3f622305b89f8b69eca2cbf379.jpg',
    'https://i.pinimg.com/736x/78/69/71/7869718d91d305415b6c4bcdf1911143.jpg',
    'https://i.pinimg.com/736x/a9/2a/70/a92a7020d99e15a2903d2a4cee24469b.jpg',
    'https://i.pinimg.com/736x/d4/d2/0c/d4d20ce02822ee72406fbb8ea1045415.jpg',
    'https://i.pinimg.com/736x/56/06/4c/56064c07582ffa37dc9987c589967c18.jpg',
    'https://i.pinimg.com/736x/54/61/23/546123454db7015e544d34de57f3d3ab.jpg',
    'https://i.pinimg.com/736x/c0/f2/c9/c0f2c98dff91fb957611800b47087909.jpg',
    'https://i.pinimg.com/736x/2f/43/ee/2f43eea558996b0f4444a4571d8258e4.jpg',
    'https://i.pinimg.com/736x/02/11/e6/0211e6f90da048e3cb32dfbaed6c6e1d.jpg',
    'https://i.pinimg.com/736x/af/0b/e8/af0be8cca4c9b57240536853760c931b.jpg',
    'https://i.pinimg.com/736x/8d/0b/a5/8d0ba5e55c2d205c242f2805b40af843.jpg',
    'https://i.pinimg.com/736x/20/d9/5d/20d95dd52f51d3e60e2b7a2daa941dcb.jpg',
    'https://i.pinimg.com/736x/0b/1d/6f/0b1d6f2ff62a077fc0aa15cbfaa51634.jpg',
    'https://i.pinimg.com/736x/2d/26/d3/2d26d35682a19b4460408464f229af17.jpg',
    'https://i.pinimg.com/736x/69/dd/73/69dd732972c8f21db0fdf675aa3d46f3.jpg',
    'https://i.pinimg.com/736x/0d/41/93/0d4193c474d93ee445071d458a5dc46c.jpg',
    'https://i.pinimg.com/736x/1f/3e/0c/1f3e0c94e2502c1fb3cb11861655fa46.jpg',
    'https://i.pinimg.com/736x/d4/f2/10/d4f210ac63a751a2fca8d34139da9ec2.jpg',
    'https://i.pinimg.com/736x/dd/37/93/dd379378b656ac52e349e9a46c3335b7.jpg',
    'https://i.pinimg.com/736x/6b/22/6b/6b226b976506fa55fdb76a51f494167a.jpg',
    'https://i.pinimg.com/736x/0b/c7/66/0bc766cebcc6cd6a332b5cc95802574c.jpg',
    'https://i.pinimg.com/736x/17/5c/0c/175c0ca6b1657048c31537ec6688a548.jpg',
    'https://i.pinimg.com/736x/d7/fc/f8/d7fcf80ca37b61a570e9c415e5d30e78.jpg',
    'https://i.pinimg.com/736x/a7/7d/ec/a77dec37b1da1f1f81c769aa82cbdd42.jpg',
    'https://i.pinimg.com/736x/20/bb/14/20bb144ff659eab9a53b2c48c21179f9.jpg',
    'https://i.pinimg.com/736x/3d/b9/c7/3db9c7a92619d170e2f8db57305c33ae.jpg',
    'https://i.pinimg.com/736x/fd/c4/c4/fdc4c460ea1ee3f13fa0abf2cace9ba6.jpg',
    'https://i.pinimg.com/736x/80/bf/f8/80bff88dbc41d94788a910043eb92ad9.jpg',
    'https://i.pinimg.com/736x/18/f9/8e/18f98edb22f24420433bc57578721865.jpg',
    'https://i.pinimg.com/736x/2d/b6/9b/2db69b5d279c8b126c9d502ab5a7e87e.jpg',
    'https://i.pinimg.com/736x/34/4e/b8/344eb83bcaf0eb22bd7dc4e4cc9c4be0.jpg',
    'https://i.pinimg.com/736x/2c/04/6b/2c046b6c95dfd2647cbfa4ff752e91d8.jpg',
    'https://i.pinimg.com/736x/04/67/46/046746ea458713ab46b6a3777290b7e4.jpg',
    'https://i.pinimg.com/736x/80/88/bd/8088bd24514196897ccba69e45782159.jpg',
    'https://i.pinimg.com/736x/5d/d5/b3/5dd5b3e33f05d9a6553dc29209b6af53.jpg',
    'https://i.pinimg.com/736x/c6/d2/22/c6d22263d764306a284dbb7b632278bd.jpg',
    'https://i.pinimg.com/736x/37/25/60/372560153f799e86cddbada8f1322d29.jpg',
    'https://i.pinimg.com/736x/b5/4d/27/b54d270ba50fdedb389c77eb0c657bf5.jpg',
    'https://i.pinimg.com/736x/11/56/c4/1156c46251d2bafbe000660ff25a9d0d.jpg',
    'https://i.pinimg.com/736x/7a/e3/40/7ae3404dab26ef571c22c5e67ef6890f.jpg',
    'https://i.pinimg.com/736x/f1/16/4d/f1164dd0b1461edef69d507b8b4da206.jpg',
    'https://i.pinimg.com/736x/74/e1/e9/74e1e9c8607f4a06384677ac8d796b12.jpg',
    'https://i.pinimg.com/736x/6f/75/1b/6f751b2db058c825f343df1baf2aaf07.jpg',
    'https://i.pinimg.com/736x/51/ca/77/51ca775f3fcf42e388e1320ed64c6c26.jpg',
    'https://i.pinimg.com/736x/dc/e2/f5/dce2f58cd98755921e5df771289fe6da.jpg',
    'https://i.pinimg.com/736x/56/f9/0e/56f90e1fa58e8b27f0b8b20cababe183.jpg',
    'https://i.pinimg.com/736x/65/75/86/657586c9e12aaf9a3d23573fb77544f7.jpg',
    'https://i.pinimg.com/736x/0f/65/c3/0f65c35d95de565d575a425d8419df4b.jpg',
    'https://i.pinimg.com/736x/0f/70/ad/0f70ad383945d3fceb075bffe96ec9e1.jpg',
    'https://i.pinimg.com/736x/18/14/ee/1814eeae6b204fb1d0d772a33bdda2fd.jpg',
    'https://i.pinimg.com/736x/30/c3/9a/30c39a531671e4300904576adb73d60d.jpg',
    'https://i.pinimg.com/736x/ee/98/70/ee987087f6aad6c339620003550b87b2.jpg',
    'https://i.pinimg.com/736x/f6/9d/b1/f69db12cd839a1c92ff2043a53295436.jpg',
    'https://i.pinimg.com/736x/59/7e/0e/597e0ef6f49219301bd52b22352bc236.jpg',
    'https://i.pinimg.com/736x/0a/75/f8/0a75f8619c4ee666b79e777092526f23.jpg',
    'https://i.pinimg.com/736x/02/b8/cc/02b8ccd9d0388ec100bdd82a240f2f40.jpg',
    'https://i.pinimg.com/736x/c7/15/a5/c715a5c062fbcdf25055856566a95718.jpg',
    'https://i.pinimg.com/736x/82/8d/b2/828db23c6841e48b03c23b486179c1bf.jpg',
    'https://i.pinimg.com/736x/92/ab/a6/92aba6949cbfd5ab4036b8e4c4c4a752.jpg',
    'https://i.pinimg.com/736x/01/a0/10/01a010ffafdf72916592fcef63abe7b4.jpg',
    'https://i.pinimg.com/736x/91/ce/c5/91cec56274a9dde4e3a520c98f561c75.jpg',
    'https://i.pinimg.com/736x/a1/9e/92/a19e9239a6b09a90f47871d029429f89.jpg',
    'https://i.pinimg.com/736x/cc/f9/08/ccf908449d82ec8dd90aac9f89fafe88.jpg',
    'https://i.pinimg.com/736x/a2/5f/62/a25f62dc5b8a1e178e1cb0d956252436.jpg',
    'https://i.pinimg.com/736x/67/cc/e4/67cce40da1c377c8f526feacce0c0bd8.jpg',
  ],
};

const SAMPLE_POSTS = {
  trading: [
    {
      content: 'Quên khái niệm Hỗ trợ/Kháng cự cũ kỹ đi. Hãy nói về Tần số (Frequency).\n\nTrong phương pháp Frequency Method của Gem Trading, thị trường không di chuyển ngẫu nhiên, nó di chuyển giữa các vùng tần số giao dịch: HFZ (High Frequency Zone - Vùng Bán) và LFZ (Low Frequency Zone - Vùng Mua).\n\nTại sao gọi là HFZ? Vì tại đó tần suất người muốn bán áp đảo, giá buộc phải quay đầu giảm. Ngược lại với LFZ.\n\nKhi bạn nhìn chart dưới lăng kính Frequency, bạn không đoán đỉnh đáy nữa. Bạn chỉ đơn giản là đợi giá đi vào vùng tần số LFZ để tìm cơ hội Buy và HFZ để tìm cơ hội Sell. Đơn giản, khoa học và loại bỏ cảm xúc.\n\nAnh em đã xác định được vùng LFZ gần nhất của Bitcoin chưa? Comment bên dưới nhé! 👇',
      hashtags: ['#GemTrading', '#FrequencyMethod', '#HFZ', '#LFZ', '#crypto'],
    },
    {
      content: 'UPU (Up-Pause-Up) - Mẫu hình tiếp diễn kinh điển.\n\nNhiều anh em thấy giá tăng mạnh thì sợ không dám vào, sợ đu đỉnh. Nhưng nếu hiểu về cấu trúc UPU, bạn sẽ thấy đó là cơ hội.\n\nUPU là gì? \n1. Up: Giá tăng mạnh (phe Mua tấn công).\n2. Pause: Nến nghỉ, đi ngang biên độ hẹp (phe Mua nghỉ lấy hơi, phe Bán yếu ớt).\n3. Up: Giá bùng nổ tiếp tục xu hướng.\n\nCái \'Pause\' ở giữa chính là chìa khóa. Đó là lúc thị trường tích lũy năng lượng. Thay vì FOMO đu theo cây nến xanh dài, hãy kiên nhẫn chờ nhịp Pause. Đó là điểm vào lệnh an toàn nhất trong một xu hướng tăng mạnh.\n\nCó ai vừa bắt được con sóng UPU nào không? Khoe chart đi!',
      hashtags: ['#UPU', '#GemPattern', '#tradingtips', '#crypto'],
    },
    {
      content: 'DPD (Down-Pause-Down) - Đừng bắt dao rơi khi chưa thấy đáy.\n\nTrong một xu hướng giảm, sai lầm lớn nhất là cố gắng đoán đâu là đáy. Hãy nhìn vào mẫu hình DPD.\n\nGiá giảm mạnh (Down), chững lại một chút (Pause), rồi sập tiếp (Down). Vùng \'Pause\' đó không phải là đáy, nó thường là một trạm dừng chân để phe Gấu nạp thêm đạn (Base) trước khi đạp giá xuống sâu hơn.\n\nNếu bạn thấy DPD hình thành, đừng vội mua vào. Hãy đợi giá tiếp cận LFZ (Vùng Mua) cứng phía dưới. Đừng để tài khoản \'bốc hơi\' giữa đường đi của DPD.',
      hashtags: ['#DPD', '#tradingpsychology', '#quanlyvon', '#GemTrading'],
    },
    {
      content: 'UPD (Up-Pause-Down) - Bẫy Bò (Bull Trap) hay Đảo chiều?\n\nĐây là mẫu hình khiến nhiều anh em \'đu đỉnh\' nhất. Giá đang tăng (Up), bỗng nhiên chững lại (Pause), tưởng là nghỉ để tăng tiếp... ai ngờ quay xe giảm mạnh (Down).\n\nUPD thường xuất hiện ngay tại các vùng HFZ (Vùng Bán). Khi giá rướn lên gặp HFZ, lực mua cạn kiệt tạo thành vùng Pause, và khi phe bán ập vào, cấu trúc UPD hình thành xác nhận đảo chiều.\n\nBí quyết của Gem Trading: Đừng Buy khi thấy Pause ở vùng HFZ. Hãy quan sát thật kỹ. Nếu UPD xuất hiện, đó là tín hiệu Short cực đẹp.',
      hashtags: ['#UPD', '#daochieu', '#HFZ', '#crypto'],
    },
    {
      content: 'Xác định Giá Entry và Giá Stop chuẩn chỉnh theo Frequency Method.\n\nNhiều bạn xác định được vùng HFZ/LFZ rồi nhưng vẫn bị quét Stoploss (SL) hoặc lỡ thuyền. Tại sao?\n\n- Giá Entry (Proximal Line): Là đường biên gần giá hiện tại nhất của vùng zone. Đặt limit ở đây để dễ khớp lệnh.\n- Giá Stop (Distal Line): Là đường biên xa nhất của vùng zone. SL phải đặt SAU đường này một chút (cộng thêm spread/buffer) để tránh bị quét râu.\n\nKỷ luật là: Chạm Giá Stop là cắt, không gồng, không tiếc. Vì một khi giá phá vỡ Distal Line, vùng tần số đó đã bị vô hiệu hóa (Broken Zone).',
      hashtags: ['#GiaEntry', '#GiaStop', '#riskmanagement', '#GemTrading'],
    },
    {
      content: 'DPU (Down-Pause-Up) - Vẻ đẹp của sự đảo chiều.\n\nThị trường đang rơi tự do (Down), bỗng dưng chững lại (Pause) và bật tăng mạnh mẽ (Up). Đây chính là DPU - mẫu hình ưa thích của dân săn đáy.\n\nDPU thường xuất hiện tại LFZ (Vùng Mua). Vùng Pause ở đây cho thấy phe Bán đã kiệt sức và phe Mua bắt đầu gom hàng âm thầm. Khi cây nến Up xuất hiện phá vỡ vùng Pause, đó là lúc thị trường xác nhận đảo chiều.\n\nAnh em có công cụ Pattern Scanner của Gem chưa? Nó quét DPU tự động đấy, đỡ phải căng mắt nhìn chart 24/7.',
      hashtags: ['#DPU', '#bottomfishing', '#tradingtools', '#crypto'],
    },
    {
      content: 'Tại sao cần dùng Pattern Scanner (Tier 1)?\n\nThị trường Crypto chạy 24/7 với hàng nghìn đồng coin. Mắt thường không thể soi hết được các mẫu hình DPD, UPU, UPD, DPU... đang hình thành ở đâu.\n\nCông cụ Scanner của Gem Trading ở Tier 1 giúp bạn lọc ra 7 patterns cơ bản ngay lập tức. \nThay vì đi săn mồi trong bóng tối, bạn được trang bị kính nhìn đêm. Việc của bạn chỉ là check lại xem pattern đó có nằm ở HFZ/LFZ uy tín hay không rồi bóp cò.\n\nTrading thông minh là biết dùng công cụ để giải phóng sức lao động.',
      hashtags: ['#PatternScanner', '#Tier1', '#tradingtools', '#Gemral'],
    },
    {
      content: 'Tâm lý giao dịch tại HFZ (High Frequency Zone).\n\nKhi giá chạm HFZ, thường tin tức tốt sẽ bơm ra rất nhiều, nến xanh dựng đứng. Tâm lý đám đông lúc này là: \'To the moon\', \'Phá đỉnh rồi\'.\n\nNhưng với Gem Trader, HFZ là vùng để canh BÁN, hoặc ít nhất là chốt lời, tuyệt đối không mua. Tại HFZ, tần suất người bán đang chờ sẵn rất dày đặc. Mua ở đây tỷ lệ rủi ro cực cao.\n\nHãy tham lam ở LFZ và sợ hãi ở HFZ. Ngược lại với đám đông là cách để sống sót.',
      hashtags: ['#HFZ', '#tamlygiao dich', '#contrarian', '#GemTrading'],
    },
    {
      content: 'Double Top (Hai Đỉnh) trong tư duy Frequency Method.\n\nMô hình Hai Đỉnh ai cũng biết, nhưng tại sao nhiều người trade mô hình này vẫn thua? Vì họ trade nó ở lưng chừng.\n\nDouble Top chỉ thực sự mạnh khi đỉnh thứ 2 chạm vào HFZ (Vùng Bán) và tạo ra phản ứng từ chối giá. Khi đó, HFZ đóng vai trò là tấm khiên bảo vệ cho lệnh Short của bạn.\n\nKết hợp mô hình cổ điển với tư duy tần số (Frequency) sẽ nâng Winrate lên một tầm cao mới.',
      hashtags: ['#DoubleTop', '#HFZ', '#phantichkythuat', '#GemTrading'],
    },
    {
      content: 'Quản lý vốn: Bài học từ LFZ bị thủng.\n\nKhông có vùng LFZ (Vùng Mua) nào là bất bại. Dù LFZ có đẹp đến đâu, là khung tuần hay khung tháng, nó vẫn có thể bị phá vỡ nếu lực bán quá mạnh (ví dụ tin thiên nga đen).\n\nĐó là lý do chúng ta luôn phải có Giá Stop (Distal Line). Khi giá phá qua Giá Stop của LFZ, đừng cố gồng, đừng hy vọng. Chấp nhận lỗ 1-2% tài khoản và chờ cơ hội ở LFZ tiếp theo bên dưới.\n\nThua một trận đánh để thắng cả cuộc chiến. Đừng để một lần cố chấp mà cháy cả tài khoản.',
      hashtags: ['#LFZ', '#quanlyrui ro', '#stoploss', '#crypto'],
    },
    {
      content: 'Telegram Alert Bot - Trợ lý đắc lực cho Trader bận rộn.\n\nBạn đang đi làm, đi chơi, hay đang ngủ... thị trường vẫn chạy. Làm sao để không lỡ kèo ngon?\n\nBot báo động của Gem Trading (Tier 1) sẽ \'ting ting\' ngay về điện thoại khi giá chạm HFZ/LFZ quan trọng hoặc khi Scanner phát hiện ra các mẫu hình như Head & Shoulders, DPU, UPD...\n\nĐừng để mình trở thành nô lệ của màn hình. Hãy để công nghệ phục vụ bạn.',
      hashtags: ['#TelegramBot', '#Tier1', '#passiveincome', '#GemTrading'],
    },
    {
      content: 'Đừng nhầm lẫn \'Nến Rút Chân\' với LFZ.\n\nThấy một cây nến rút chân dài ngoằng, nhiều bạn vội vàng nhảy vào mua. Nhưng hãy nhìn sang bên trái biểu đồ. Cây nến đó có chạm vào vùng LFZ (Vùng Mua) nào không? Hay nó đang rút chân giữa hư không?\n\nNến rút chân chỉ có giá trị khi nó phản ứng tại LFZ. Đó là sự xác nhận rằng phe Mua tại vùng tần số thấp này đã kích hoạt. Nếu không có LFZ đỡ lưng, cây nến đó chỉ là bẫy dụ gà thôi.',
      hashtags: ['#LFZ', '#nenNhat', '#priceaction', '#GemTips'],
    },
    {
      content: 'Inverse Head and Shoulders (Vai Đầu Vai Ngược) & Tier 2.\n\nĐây là mẫu hình đảo chiều tăng giá cực mạnh, thường xuất hiện ở cuối xu hướng giảm. Nhưng để soi ra nó trong hàng trăm cặp coin là cực hình.\n\nỞ gói Tier 2, Advanced Pattern Scanner sẽ tự động quét mẫu hình số 10 này cho bạn. Nhiệm vụ của bạn chỉ là kiểm tra xem Vai Phải của nó có đang được đỡ bởi một LFZ hay DPU nhỏ nào không để tối ưu điểm vào lệnh.\n\nCông nghệ + Kiến thức chuẩn = Lợi nhuận.',
      hashtags: ['#Tier2', '#AdvancedScanner', '#HeadAndShoulders', '#GemTrading'],
    },
    {
      content: 'Câu chuyện về sự kiên nhẫn: Chờ đợi DPU.\n\nHôm qua thị trường sập mạnh, mình thấy nhiều anh em hoảng loạn bán tháo, cũng có anh em vội vàng bắt đáy rồi đứt tay.\n\nMình thì ngồi im. Mình đợi gì? Mình đợi giá về đúng LFZ khung H4 và xuất hiện mẫu hình DPU (Down-Pause-Up). \n\nSáng nay DPU đã hình thành. Giá giảm, chững lại tạo Base, rồi bật tăng phá vỡ Base. Đó là lúc mình vào lệnh với Giá Stop ngay dưới Distal line. Giờ thì ung dung gồng lãi. Trading là công việc của sự chờ đợi, không phải của việc click chuột liên tục.',
      hashtags: ['#DPU', '#patience', '#mindset', '#crypto'],
    },
    {
      content: 'Flag Pattern (Mô hình Cờ) - Tier 3.\n\nTrong Tier 3 (All patterns), chúng ta có Bull Flag và Bear Flag. Đây là các mẫu hình tiếp diễn xu hướng cực mạnh.\n\nHãy tưởng tượng: \n- Bull Flag giống như một UPU khổng lồ trên khung thời gian lớn. Cán cờ là Up, Lá cờ là Pause, và cú Breakout là Up tiếp theo.\n- Bear Flag chính là DPD phiên bản rộng hơn.\n\nHiểu được bản chất Frequency (Tần số) đằng sau các mẫu hình cổ điển sẽ giúp bạn tự tin hơn rất nhiều.',
      hashtags: ['#FlagPattern', '#Tier3', '#UPU', '#DPD'],
    },
    {
      content: 'Đa khung thời gian (Multi-timeframe) trong Frequency Method.\n\nĐừng chỉ nhìn vào một khung thời gian. \n- LFZ của khung Tuần (Weekly) sẽ bao trùm và mạnh hơn LFZ của khung H4.\n- Một mẫu hình đảo chiều DPU ở khung H1 sẽ uy tín hơn nếu nó nằm ngay tại LFZ của khung D1.\n\nHãy dùng khung lớn để xác định Vùng (Zone), dùng khung nhỏ để tìm Mẫu hình (Pattern) vào lệnh. Đó là cách bắn tỉa của Gem Trader.',
      hashtags: ['#multitimeframe', '#LFZ', '#DPU', '#GemStrategy'],
    },
    {
      content: 'Rounding Bottom (Đáy Tròn) - Mẫu hình số 11 (Tier 2).\n\nĐây là mẫu hình cho thấy sự chuyển giao quyền lực từ từ, êm ái từ phe Gấu sang phe Bò. Nó giống như một cái chén (Cup-shaped).\n\nRounding Bottom thường là dấu hiệu của sự tích lũy dài hạn. Khi Scanner Tier 2 báo tín hiệu này, hãy chú ý. Rất có thể một chu kỳ tăng trưởng mới (Uptrend) đang bắt đầu hình thành từ vùng LFZ bền vững.',
      hashtags: ['#RoundingBottom', '#Tier2', '#tichluy', '#crypto'],
    },
    {
      content: 'Tại sao chúng ta dùng từ \'Frequency\' (Tần số)?\n\nVì thị trường tài chính thực chất là sự dao động của năng lượng tiền tệ. Tại các mức giá nhất định (HFZ/LFZ), tần suất giao dịch tăng đột biến do sự tập trung của các lệnh chờ (Limit orders) từ các định chế tài chính lớn (Cá mập).\n\nChúng ta không trade theo cảm tính. Chúng ta trade theo dấu vết năng lượng. Khi bạn hiểu được Frequency, bạn đang lắng nghe nhịp đập thực sự của thị trường.',
      hashtags: ['#FrequencyMethod', '#philosophy', '#marketmaker', '#Gemral'],
    },
    {
      content: 'Engulfing (Nến Nhấn chìm) & Tier 3.\n\nEngulfing là một tín hiệu đảo chiều mạnh (Mẫu hình số 21). \n- Bullish Engulfing tại LFZ: Tín hiệu Mua đẹp.\n- Bearish Engulfing tại HFZ: Tín hiệu Bán đẹp.\n\nTuy nhiên, Engulfing xuất hiện \'giữa đường\' (không chạm Zone nào) thì thường là nhiễu. Đừng để thị trường lừa. Hãy luôn hỏi: \'Setup này đang nằm ở Vùng Tần Số nào?\'',
      hashtags: ['#Engulfing', '#Tier3', '#priceaction', '#GemTips'],
    },
    {
      content: 'Tổng kết tuần với Analytics (Free Tier).\n\nCuối tuần rồi, hãy dành thời gian xem lại hiệu suất. Công cụ Analytics của Gemral giúp bạn nhìn lại:\n- Tỷ lệ thắng các mẫu hình: Bạn đánh DPU tốt hơn hay UPU tốt hơn?\n- Bạn thường chết ở HFZ hay LFZ?\n\nCon số không biết nói dối. Hiểu rõ điểm mạnh điểm yếu của mình là bước đầu tiên để trở thành Pro Trader. Chúc anh em cuối tuần vui vẻ và bình an bên gia đình! 🙏',
      hashtags: ['#Analytics', '#review', '#phattrienbanthan', '#Gemral'],
    },
    {
      content: 'Symmetrical Triangle (Tam giác cân) - Sự nén lò xo của thị trường.\n\nKhi giá dao động với biên độ ngày càng hẹp, tạo thành hình tam giác cân (Mẫu hình số 13 trong Tier 2), đó là lúc thị trường đang nén năng lượng cực đại. Phe Mua và Phe Bán đang giằng co quyết liệt.\n\nTrong Frequency Method, chúng ta không đoán hướng phá vỡ. Chúng ta chờ đợi. \n- Nếu giá phá vỡ cạnh trên và tạo cấu trúc UPU (Up-Pause-Up), chúng ta Buy.\n- Nếu giá phá vỡ cạnh dưới và tạo DPD (Down-Pause-Down), chúng ta Sell.\n\nĐừng cố gắng đoán phe nào thắng khi trọng tài chưa thổi còi. Hãy để Advanced Pattern Scanner (Tier 2) làm nhiệm vụ canh gác cho bạn.',
      hashtags: ['#SymmetricalTriangle', '#Tier2', '#marketstructure', '#GemTrading'],
    },
    {
      content: 'Ascending Triangle (Tam giác tăng) - Dấu hiệu Bò húc.\n\nĐây là mẫu hình số 14 (Tier 2), thường xuất hiện trong xu hướng tăng. Đáy sau cao hơn đáy trước (phe Mua ngày càng hung hãn), nhưng đỉnh vẫn bị chặn bởi một vùng giá đi ngang (HFZ tạm thời).\n\nKhi phe Mua hấp thụ hết lực bán tại HFZ đó, giá sẽ bùng nổ (Breakout). Điểm vào lệnh đẹp nhất không phải lúc breakout, mà là lúc giá hồi về (Retest) vùng HFZ cũ (nay đã chuyển thành LFZ) và hình thành nến xác nhận.\n\nAnh em nào đang hold coin mà thấy mô hình này thì cứ vững tay chèo nhé.',
      hashtags: ['#AscendingTriangle', '#bullish', '#tradingpatterns', '#crypto'],
    },
    {
      content: 'Descending Triangle (Tam giác giảm) - Cẩn thận củi lửa.\n\nNgược lại với tam giác tăng, Tam giác giảm (Mẫu hình số 15 - Tier 2) cho thấy phe Bán đang ép giá xuống thấp dần, trong khi phe Mua chỉ cố thủ yếu ớt tại một vùng giá ngang (LFZ tạm thời).\n\nMột khi LFZ này bị thủng, giá sẽ rơi rất nhanh. Trong Crypto, mô hình này thường dẫn đến những cú \'dump\' mạnh. Nếu Scanner báo tín hiệu này, hãy cân nhắc thoát hàng hoặc tìm vị thế Short.\n\nĐừng chống lại trọng lực của thị trường.',
      hashtags: ['#DescendingTriangle', '#bearish', '#riskmanagement', '#GemTrading'],
    },
    {
      content: 'FOMO vs. JOMO - Bạn chọn tâm thế nào?\n\nFOMO (Fear Of Missing Out): Sợ bỏ lỡ, thấy xanh là mua bất chấp, thấy đỏ là bán tống bán tháo. Kết quả: Đu đỉnh bán đáy.\n\nJOMO (Joy Of Missing Out): Niềm vui khi bỏ lỡ. Thấy thị trường bay mà không có vị thế? Không sao cả. Vì mình biết nó không nằm trong kế hoạch, không nằm tại LFZ của mình.\n\nNgười theo trường phái Frequency Method luôn bình thản. Vì họ biết thị trường luôn di chuyển theo tần số. Lỡ nhịp này thì chờ nhịp khác. Cơ hội trong Crypto nhiều như nước biển, chỉ sợ bạn hết tiền (vốn) trước khi hứng được nước thôi.',
      hashtags: ['#JOMO', '#FOMO', '#tamlytrading', '#Gemral'],
    },
    {
      content: 'Fresh Zone vs. Used Zone - Độ tươi của vùng giá.\n\nTại sao cùng là LFZ (Vùng Mua), nhưng có cái giá bật tăng mạnh, có cái giá lại xuyên thủng?\n\nBí mật nằm ở độ \'tươi\' (Freshness). \n- Fresh Zone: Vùng LFZ/HFZ chưa từng bị giá chạm lại (Retest). Đây là vùng chứa nhiều lệnh chờ nhất -> Phản ứng mạnh nhất.\n- Used Zone: Vùng đã bị chạm nhiều lần. Giống như một bức tường bị đục khoét nhiều lần, nó sẽ yếu đi và dễ vỡ.\n\nKinh nghiệm xương máu: Chỉ nên trade ở lần chạm đầu tiên hoặc thứ hai. Đến lần thứ 3, thứ 4 thì rủi ro thủng zone là cực cao. Hãy ưu tiên Fresh Zone!',
      hashtags: ['#FreshZone', '#tradingtips', '#FrequencyMethod', '#GemTrading'],
    },
    {
      content: 'Wedge - Mẫu hình số 20 (Tier 3).\n\nRising Wedge thường báo hiệu đảo chiều GIẢM.\nFalling Wedge thường báo hiệu đảo chiều TĂNG.\n\nHãy tưởng tượng wedge giống như một cái lò xo bị ép chặt lại ở cuối con đường. Khi giá phá vỡ wedge, nó thường chạy rất mạnh.\n\nTuy nhiên, đừng trade Wedge một cách mù quáng. Hãy nhìn xem Wedge đó đang hướng về đâu? Nếu Rising Wedge mà mũi nhọn chọc thẳng vào HFZ khung Tuần -> Chuẩn bị Short full giáp (nhưng nhớ quản lý vốn nhé).',
      hashtags: ['#WedgePattern', '#Tier3', '#technicalanalysis', '#crypto'],
    },
    {
      content: 'Bull Flag (Cờ Tăng) - Mẫu hình số 16 (Tier 3).\n\nTrong một xu hướng tăng mạnh, giá thường không tăng một mạch mà sẽ có nhịp nghỉ, tạo thành hình lá cờ (Flag). \n\nĐây là món quà của thị trường dành cho những ai lỡ chuyến tàu đầu tiên. Khi giá phá vỡ lá cờ đi lên, xu hướng tăng sẽ tiếp diễn. \n\nTarget của mô hình này thường bằng chiều dài của cán cờ. Đo cán cờ xong ốp lên, đặt TP và ngồi rung đùi. Tier 3 Scanner sẽ giúp bạn tìm ra những lá cờ này trong tích tắc.',
      hashtags: ['#BullFlag', '#Tier3', '#continuation', '#GemTrading'],
    },
    {
      content: 'Bear Flag (Cờ Giảm) - Mẫu hình số 17 (Tier 3).\n\nNgược lại với Cờ Tăng, Cờ Giảm xuất hiện trong xu hướng xuống. Giá hồi phục nhẹ (tạo lá cờ hướng lên) nhưng volume yếu ớt. Đây là lúc phe Bò cố gắng vùng vẫy nhưng vô vọng.\n\nKhi giá gãy cạnh dưới lá cờ, đó là lúc phe Gấu tiếp tục cuộc thảm sát. Nếu bạn đang long, thấy Bear Flag thì lo mà chạy ngay đi trước khi quá muộn.',
      hashtags: ['#BearFlag', '#Tier3', '#bearmarket', '#crypto'],
    },
    {
      content: 'R:R (Risk:Reward) - Tỷ lệ vàng trong trading.\n\nĐừng bao giờ vào lệnh nếu tỷ lệ R:R dưới 1:2. Nghĩa là nếu chấp nhận mất 1 đồng, bạn phải nhắm tới việc ăn ít nhất 2 đồng.\n\nVí dụ: Vào lệnh tại LFZ. \nGiá Entry: $100\nGiá Stop (dưới Distal line): $98 (Rủi ro $2)\nTarget (tại HFZ gần nhất): $104 (Lợi nhuận $4)\n=> R:R = 1:2. Kèo này chơi được.\n\nNếu HFZ quá gần, chỉ ăn được $1 mà rủi ro mất $2 (R:R = 1:0.5) -> BỎ. Dù chart đẹp đến mấy cũng BỎ. Chúng ta là nhà đầu tư, không phải con bạc khát nước.',
      hashtags: ['#RiskReward', '#quanlyvon', '#tradingplan', '#Gemral'],
    },
    {
      content: 'Stop Hunt (Săn thanh khoản) - Chiêu trò của Cá mập.\n\nBạn đặt Stoploss ngay dưới vùng hỗ trợ (theo sách giáo khoa). Giá chọc xuống, cắn SL của bạn, rồi bay vút lên. Cay không? Quá cay.\n\nĐó là Stop Hunt. Cá mập biết đám đông đặt SL ở đâu. Họ cần thanh khoản để khớp lệnh mua khổng lồ của họ. \n\nCách khắc phục trong Frequency Method: Luôn đặt Giá Stop cách Distal Line một khoảng (Buffer). Và tốt nhất, hãy đợi nến đóng cửa. Nếu chỉ là râu nến quét qua rồi rút chân, đó là Stop Hunt. Nếu thân nến đóng hẳn dưới Zone, đó là Breakout thật.',
      hashtags: ['#StopHunt', '#marketmaker', '#DistalLine', '#GemTips'],
    },
    {
      content: 'Morning Star / Evening Star (Sao Mai / Sao Hôm) - Mẫu hình số 22 (Tier 3).\n\nĐây là bộ 3 nến đảo chiều cực mạnh.\n- Morning Star (Sao Mai): Xuất hiện ở đáy, báo hiệu bình minh (tăng giá). Nến 1 đỏ dài, Nến 2 nhỏ (doji/spinning top), Nến 3 xanh dài.\n- Evening Star (Sao Hôm): Xuất hiện ở đỉnh, báo hiệu hoàng hôn (giảm giá).\n\nLưu ý quan trọng: Bộ nến này chỉ có giá trị khi nó nằm tại LFZ (với Sao Mai) hoặc HFZ (với Sao Hôm). Nếu nó nằm lơ lửng giữa chart -> Không có ý nghĩa.',
      hashtags: ['#MorningStar', '#EveningStar', '#Tier3', '#nenNhat'],
    },
    {
      content: 'Tầm quan trọng của Proximal Line và Distal Line.\n\nTrong Gem Trading, chúng ta không vẽ vùng Supply/Demand (HFZ/LFZ) một cách tùy tiện. Chúng ta dùng 2 đường:\n\n1. Proximal Line (Đường gần): Nơi bắt đầu vùng giá. Đây là nơi đặt Limit Order.\n2. Distal Line (Đường xa): Nơi kết thúc vùng giá. Đây là ranh giới sinh tử.\n\nKhoảng cách giữa 2 đường này quyết định độ rộng của Zone. Zone càng hẹp, Rủi ro càng thấp, Reward càng cao (R:R đẹp). Zone quá rộng thì nên cân nhắc bỏ qua hoặc giảm volume. \n\nVẽ đúng Zone là bước đầu tiên để chiến thắng.',
      hashtags: ['#ProximalLine', '#DistalLine', '#technicalanalysis', '#GemTrading'],
    },
    {
      content: 'Rounding Top (Đỉnh Tròn) - Mẫu hình số 12 (Tier 2).\n\nTrái ngược với Đáy Tròn, Đỉnh Tròn thể hiện sự suy yếu từ từ của phe Mua. Giá không sập ngay mà lịm dần, lịm dần...\n\nKhi thấy mô hình cái bát úp ngược này, hãy cẩn thận với các vị thế Long. Rất có thể thị trường đang âm thầm phân phối hàng trước khi bước vào chu kỳ giảm giá dài hạn. Advanced Pattern Scanner sẽ giúp bạn nhận diện sớm nguy cơ này.',
      hashtags: ['#RoundingTop', '#Tier2', '#distribution', '#crypto'],
    },
    {
      content: 'Cup and Handle (Cốc và Tay Cầm) - Mẫu hình số 23 (Tier 3).\n\nĐây là mô hình kinh điển của sự tiếp diễn tăng giá. \n- Phần Cốc (Cup): Giá đi vòng cung tích lũy.\n- Phần Tay Cầm (Handle): Giá điều chỉnh nhẹ (thường là mô hình Cờ).\n\nĐiểm mua đẹp nhất là khi giá phá vỡ phần Tay Cầm hoặc retest lại miệng cốc. Target lợi nhuận tính bằng độ sâu của cốc. Trong Crypto, mô hình này khi xuất hiện ở khung tuần (Weekly) thường mang lại lợi nhuận cực khủng (x5, x10 tài khoản).',
      hashtags: ['#CupAndHandle', '#Tier3', '#bullishpattern', '#GemTrading'],
    },
    {
      content: 'Phân tích Đa khung thời gian (Top-down Analysis).\n\nĐừng bao giờ trade mà chỉ nhìn một khung thời gian. Hãy tuân thủ quy trình:\n1. Mở khung Tháng/Tuần: Xác định Xu hướng chính và các HFZ/LFZ lớn (Big Boss).\n2. Mở khung Ngày (D1): Tìm các cấu trúc sóng hiện tại.\n3. Mở khung H4/H1: Tìm điểm vào lệnh (Entry) chi tiết theo các mẫu hình (DPD, UPU, Engulfing...).\n\n\"Nhìn xa trông rộng, hành động chi tiết\". Đừng để những con sóng nhỏ ở M15 đánh lừa bạn khi cơn bão lớn ở khung Tuần đang ập tới.',
      hashtags: ['#topdownanalysis', '#multitimeframe', '#tradingstrategy', '#crypto'],
    },
    {
      content: 'Trading là kinh doanh, không phải sở thích.\n\nNếu bạn coi trading là sở thích, nó sẽ tiêu tốn tiền của bạn (giống như đi câu cá, chơi golf). Nếu bạn coi nó là kinh doanh (Business), nó sẽ mang lại tiền cho bạn.\n\nDoanh nghiệp cần gì?\n- Vốn (Capital)\n- Kế hoạch kinh doanh (Trading Plan)\n- Quản lý rủi ro (Risk Management)\n- Kiểm soát chi phí (Losses & Fees)\n- Đánh giá hiệu suất (Journaling)\n\nHãy nghiêm túc với từng lệnh giao dịch như thể bạn đang ký một hợp đồng trị giá tiền tỷ. Thái độ quyết định trình độ.',
      hashtags: ['#businessmindset', '#tradingpsychology', '#Gemral', '#dautu'],
    },
    {
      content: 'Hammer / Inverted Hammer (Nến Búa / Búa Ngược) - Mẫu hình số 25 (Tier 3).\n\nBạn thấy một cây nến có râu dài, thân nhỏ (nhìn như cái búa). Ý nghĩa là gì?\n\nNếu nó xuất hiện ở LFZ (Vùng Mua): Nó cho thấy phe Bán đã cố đẩy giá xuống nhưng bị phe Mua từ chối mạnh mẽ, đẩy ngược lên. Tín hiệu đảo chiều Tăng!\n\nNhưng nhớ nhé, \"Một con én không làm nên mùa xuân\". Cây búa chỉ có giá trị khi nó đóng nến xanh (hoặc đỏ thân nhỏ) và NẰM TẠI LFZ. Búa mà nằm lơ lửng thì chỉ dùng để... đóng đinh thôi.',
      hashtags: ['#HammerCandle', '#Tier3', '#priceaction', '#GemTips'],
    },
    {
      content: 'Shooting Star / Hanging Man (Sao Đổi Ngôi / Người Treo Cổ) - Mẫu hình số 26 (Tier 3).\n\nNghe tên là thấy rùng mình rồi. Đây là các nến báo hiệu Đỉnh.\n- Shooting Star: Râu trên dài, thân nhỏ. Xuất hiện tại HFZ. Tín hiệu phe Mua bị từ chối, phe Bán đập giá xuống.\n- Hanging Man: Nhìn giống cây búa nhưng xuất hiện ở đỉnh xu hướng tăng. \n\nKhi thấy các nến này tại HFZ, hãy siết chặt Stoploss hoặc chốt lời ngay lập tức. Đừng tham lam nữa.',
      hashtags: ['#ShootingStar', '#HangingMan', '#Tier3', '#GemTrading'],
    },
    {
      content: 'Doji Patterns (Dragonfly, Gravestone) - Mẫu hình số 27 (Tier 3).\n\nDoji là nến có giá mở cửa và đóng cửa xấp xỉ bằng nhau (hình dấu cộng). Nó thể hiện sự lưỡng lự, cân bằng giữa hai phe.\n\n- Dragonfly Doji (Chuồn chuồn): Râu dưới dài -> Phe mua kiểm soát lại thế trận.\n- Gravestone Doji (Bia mộ): Râu trên dài -> Phe bán đè giá.\n\nDoji tại Zone là tín hiệu \"Chuẩn bị hành động\". Nó chưa xác nhận đảo chiều nhưng báo hiệu xu hướng cũ đã chững lại. Hãy đợi cây nến tiếp theo để xác nhận.',
      hashtags: ['#Doji', '#DragonflyDoji', '#GravestoneDoji', '#Tier3'],
    },
    {
      content: 'Đối mặt với thua lỗ: Phân tích hay Đổ lỗi?\n\nKhi dính Stoploss, phản ứng đầu tiên của bạn là gì?\n1. \"Sàn scam, cá mập thao túng, thị trường bịp bợm!\" (Đổ lỗi)\n2. \"Tại sao mình sai? Mình xác định Zone sai? Hay vào lệnh sớm? Hay đặt SL quá sát?\" (Phân tích)\n\nNgười chọn cách 1 sẽ mãi là nạn nhân. Người chọn cách 2 sẽ trở thành cao thủ. \n\nMỗi lệnh thua là một bài học đắt giá (theo nghĩa đen). Đừng phí tiền học phí mà không học được gì. Mở nhật ký ra và ghi lại ngay: \"Lệnh này thua vì... Lần sau sẽ...\"',
      hashtags: ['#mindset', '#tradingpsychology', '#growth', '#Gemral'],
    },
    {
      content: 'Falling Three Methods (Ba bước giảm) - Mẫu hình số 24 (Tier 3).\n\nĐây là mẫu hình tiếp diễn xu hướng giảm rất uy tín nhưng ít người để ý. \nCấu trúc: Một nến đỏ dài (Down), theo sau là 3 nến xanh nhỏ nằm gọn trong thân nến đầu (Pause/Retracement), và cuối cùng là một nến đỏ dài phá vỡ đáy cũ (Down tiếp diễn).\n\nTrong hệ tư tưởng Frequency, 3 nến nhỏ ở giữa chính là nhịp \'nghỉ\' của phe Bán. Nếu mẫu hình này xuất hiện ngay dưới một HFZ (Vùng Bán) vừa được hình thành, đó là tín hiệu Short bồi thêm cực đẹp. Đừng thấy 3 nến xanh mà tưởng đảo chiều nhé, đó chỉ là bẫy thôi.',
      hashtags: ['#FallingThreeMethods', '#Tier3', '#bearish', '#GemTrading'],
    },
    {
      content: 'Rising Three Methods (Ba bước tăng) - Phe Bò lấy đà.\n\nNgược lại với Falling Three Methods, mẫu hình này xuất hiện trong xu hướng tăng. \n1 Nến xanh mạnh -> 3 nến đỏ nhỏ điều chỉnh -> 1 Nến xanh mạnh phá đỉnh.\n\nĐây thực chất là một biến thể của UPU (Up-Pause-Up) trên khung thời gian nhỏ hơn. Khi Scanner Tier 3 báo tín hiệu này, hãy kiểm tra xem nó có đang được hỗ trợ bởi một LFZ bên dưới không. Nếu có, đừng ngần ngại nhồi thêm lệnh (Pyramiding) để tối ưu lợi nhuận.',
      hashtags: ['#RisingThreeMethods', '#Tier3', '#bullish', '#crypto'],
    },
    {
      content: 'Sự nhàm chán trong Trading (Boredom).\n\nBạn có biết cảm giác \'chán\' là dấu hiệu của một Trader chuyên nghiệp không? \nNewbie tìm kiếm sự hồi hộp, adrenaline như đánh bạc. Pro Trader tìm kiếm sự lặp lại nhàm chán của một quy trình chiến thắng.\n\nQuy trình của Gem Trader:\n1. Mở máy.\n2. Check Scanner (Tier 1/2/3).\n3. Xác định HFZ/LFZ.\n4. Đặt Alert.\n5. Khớp lệnh -> Set Entry, Stop, Target.\n6. Tắt máy.\n\nNó lặp đi lặp lại, không có gì kịch tính cả. Nhưng chính sự nhàm chán kỷ luật đó mới tạo ra lợi nhuận bền vững. Nếu bạn thấy trading quá hồi hộp, có lẽ bạn đang đi volume quá to rồi đấy.',
      hashtags: ['#psychology', '#kyluat', '#professionaltrader', '#Gemral'],
    },
    {
      content: 'Head & Shoulders (Vai Đầu Vai) - Mẫu hình kinh điển trong Free Tier.\n\nGem Trading tặng miễn phí công cụ quét mẫu hình này vì nó quá phổ biến. Nhưng \'phổ biến\' không có nghĩa là \'dễ ăn\'.\n\nBí mật nằm ở Vai Phải (Right Shoulder). Đừng vào lệnh khi Vai Phải còn đang lơ lửng. Hãy đợi Vai Phải chạm vào HFZ (với mô hình thuận) hoặc LFZ (với mô hình ngược) mà Vai Trái đã tạo ra trước đó. Sự hợp lưu giữa Pattern và Frequency Zone chính là tấm khiên bảo vệ vốn của bạn.',
      hashtags: ['#HeadAndShoulders', '#FreeTier', '#GemTips', '#technicalanalysis'],
    },
    {
      content: 'Vùng \'Pause\' - Trái tim của Frequency Method.\n\nTrong các cấu trúc DPD, UPU, UPD, DPU, chữ \'P\' (Pause) là quan trọng nhất. \nPause là sự chững lại, là sự cân bằng tạm thời giữa Cung và Cầu. Chính vùng Pause này tạo ra cái mà chúng ta gọi là Base (Nền giá).\n\nMột vùng HFZ/LFZ chất lượng phải có một cái Base \'xịn\' - tức là nến Pause phải nén chặt, thân nhỏ, râu ngắn. Base mà lỏng lẻo, nến to dài lộn xộn thì Zone đó rất dễ bị thủng. Hãy chọn Zone kỹ như chọn người yêu vậy!',
      hashtags: ['#Base', '#Pause', '#marketstructure', '#GemTrading'],
    },
    {
      content: 'Set and Forget (Đặt và Quên) - Đỉnh cao của tâm lý.\n\nTại sao chúng ta dùng Limit Order tại Proximal Line thay vì Market Order?\n1. Để có giá tốt nhất.\n2. Để loại bỏ cảm xúc.\n\nKhi bạn đặt lệnh Limit kèm Stoploss và TP xong, hãy tập thói quen \'Quên\' nó đi. Đừng ngồi nhìn chart cầu nguyện. \n- Nếu khớp và thắng: Tốt.\n- Nếu khớp và thua (dính Stop): Tốt, vì ta đã tuân thủ kế hoạch.\n- Nếu không khớp (Miss): Tốt, tiền vẫn còn đó.\n\nTâm bất biến giữa dòng đời vạn biến. Đó là phong thái của Gem Trader.',
      hashtags: ['#SetAndForget', '#tamlygiao dich', '#limitorder', '#crypto'],
    },
    {
      content: 'Giao dịch theo xác suất (Probability Game).\n\nKhông có mẫu hình nào thắng 100%. Ngay cả HFZ khung Tháng cũng có thể bị phá vỡ. \nTrading là trò chơi của xác suất. \n\nVí dụ: Mẫu hình DPU tại LFZ có tỷ lệ thắng 60%. Nghĩa là trong 10 lệnh, bạn sẽ thua 4 lệnh. Nếu bạn thua lệnh đầu tiên, đừng nản. Nếu bạn thua 3 lệnh liên tiếp, cũng đừng hoang mang. Miễn là bạn quản lý vốn đúng (R:R >= 1:2), thì sau 100 lệnh, bạn chắc chắn có lãi.\n\nHãy tư duy theo chuỗi lệnh (series of trades), đừng tư duy theo từng lệnh đơn lẻ.',
      hashtags: ['#probability', '#tuduydautu', '#maths', '#Gemral'],
    },
    {
      content: 'Bảo vệ nguồn vốn (Capital Preservation) là số 1.\n\nGeorge Soros từng nói: \'Quan trọng không phải là bạn đúng hay sai, mà là bạn kiếm được bao nhiêu khi đúng và mất bao nhiêu khi sai\'.\n\nTrong Frequency Method, Giá Stop (Distal Line) là chốt chặn cuối cùng. Đừng bao giờ dời SL (nới lỏng lỗ) với hy vọng giá sẽ quay đầu. Đó là hành động tự sát. \nThà cắt lỗ sớm một ngón tay còn hơn để hoại tử cả cánh tay. Còn tiền là còn cơ hội. Hết tiền là hết game.',
      hashtags: ['#riskmanagement', '#stoploss', '#capitalpreservation', '#GemTrading'],
    },
    {
      content: 'Thanh khoản (Liquidity) - Xăng của thị trường.\n\nTại sao giá hay chọc râu qua Distal Line rồi mới đảo chiều? Vì cá mập cần thanh khoản. Stoploss của đám đông chính là thanh khoản của cá mập.\n\nKhi bạn đặt SL ngay sát mép LFZ, bạn đang mời cá mập đến ăn. Hãy nới SL ra một chút (dùng ATR hoặc Buffer cố định). \nĐôi khi, việc bị quét SL rồi giá chạy đúng hướng là điều rất ức chế, nhưng đó là một phần của cuộc chơi. Hãy chấp nhận nó và tìm cơ hội khác, đừng cay cú (Revenge trade).',
      hashtags: ['#liquidity', '#marketmaker', '#stophunt', '#GemTips'],
    },
    {
      content: 'Review bộ công cụ Tier 2 (6 Web Apps).\n\nNgoài Advanced Scanner quét 15 mẫu hình, Tier 2 còn cung cấp các công cụ phân tích đa khung thời gian. \n\nViệc kết hợp các mẫu hình đảo chiều (như Rounding Bottom - số 11) với các vùng Frequency Zone (số 8, 9) giúp bạn lọc nhiễu cực tốt. \n\nĐừng chỉ dựa vào một tín hiệu đơn lẻ. Sự hội tụ (Confluence) của nhiều yếu tố: Pattern + Zone + Trend mới tạo nên một Setup xác suất cao (High Probability Setup).',
      hashtags: ['#Tier2', '#confluence', '#tradingtools', '#Gemral'],
    },
    {
      content: 'Kỷ luật là tự do.\n\nNghe có vẻ ngược đời, nhưng trong trading, chỉ có kỷ luật mới mang lại tự do tài chính. \n- Kỷ luật chờ giá về Zone.\n- Kỷ luật cắt lỗ khi chạm Distal Line.\n- Kỷ luật chốt lời khi đạt Target.\n\nNếu bạn giao dịch tùy hứng, nay đánh DPD, mai đánh theo tin tức, mốt đánh theo KOL... thì bạn sẽ mãi là nô lệ của cảm xúc. Hãy xây dựng một bộ quy tắc (Trading Rules) và tuân thủ nó như quân lệnh.',
      hashtags: ['#discipline', '#freedom', '#mindset', '#crypto'],
    },
    {
      content: 'Dự đoán (Prediction) vs. Phản ứng (Reaction).\n\nNhiều chuyên gia hay lên mạng dự đoán: \'Bitcoin sẽ lên 100k vào tháng sau\'. Đó là đoán mò.\nGem Trader không đoán. Chúng ta phản ứng.\n\n- Giá đến HFZ -> Quan sát phản ứng nến. Có DPD không? Có Shooting Star không? -> Có thì Sell, không thì thôi.\n- Giá đến LFZ -> Tìm UPU, tìm Hammer -> Có thì Buy.\n\nChúng ta là những người lướt sóng. Chúng ta không ra lệnh cho con sóng, chúng ta nương theo nó. Đừng cố gắng thông minh hơn thị trường.',
      hashtags: ['#reaction', '#flow', '#tradingphilosophy', '#GemTrading'],
    },
    {
      content: 'Backtest - Luyện tập trong phòng thí nghiệm.\n\nTrước khi mang tiền thật ra chiến trường, hãy Backtest phương pháp Frequency Method trên biểu đồ quá khứ. \nHãy tua lại chart, tìm các mẫu hình DPD/UPU, xác định Entry/Stop/Target và xem kết quả.\n\nLàm việc này 100 lần, 1000 lần. Bạn sẽ xây dựng được niềm tin vào hệ thống. Khi niềm tin đủ lớn, bạn sẽ không còn run sợ khi vào lệnh thật nữa. \n\nAnh em đã backtest được bao nhiêu lệnh rồi?',
      hashtags: ['#backtest', '#luyentap', '#experience', '#crypto'],
    },
    {
      content: 'Lãi kép (Compound Interest) - Kỳ quan thứ 8.\n\nĐừng mơ mộng x10, x100 tài khoản sau một đêm. Hãy nhắm tới mức lợi nhuận ổn định, ví dụ 5-10% mỗi tháng.\n\nVới số vốn $1000, lãi 10%/tháng, sau 1 năm bạn có $3000. Sau 5 năm bạn có $300,000. Con số khủng khiếp đúng không? \n\nBí quyết không phải là đánh to, mà là đánh đều và sống lâu. Frequency Method được thiết kế để giúp bạn kiếm tiền chậm mà chắc. Chậm là nhanh.',
      hashtags: ['#laikep', '#tuduydaichan', '#compoundinterest', '#Gemral'],
    },
    {
      content: 'Trả thù thị trường (Revenge Trading) - Con đường ngắn nhất ra đê.\n\nVừa bị quét SL mất $50, cay quá vào ngay lệnh khác volume gấp đôi để gỡ. Kết quả: Mất thêm $100. \n\nThị trường không nợ bạn gì cả. Nó không biết bạn là ai. Khi thua lỗ, hãy đóng máy, đi dạo, hít thở. Đừng cố gắng đòi lại tiền ngay lập tức. \n\nHãy nhớ khẩu quyết: \'Thị trường luôn đúng. Chỉ có cái tôi của mình là sai\'. Quay lại khi cái đầu đã lạnh.',
      hashtags: ['#revengetrading', '#tamly', '#control', '#GemTips'],
    },
    {
      content: 'Beta của Altcoin.\n\nKhi Bitcoin hắt hơi, Altcoin sổ mũi. Khi Bitcoin sập, Altcoin chia 2 chia 3. Đó là Beta (độ nhạy).\n\nNếu bạn xác định Bitcoin đang ở HFZ khung Tuần (Vùng Bán mạnh), tuyệt đối đừng Long Altcoin, dù chart Altcoin có đẹp như mơ (UPU, Flag...). Vì khi BTC sập, nó sẽ kéo sập cả thị trường.\n\nLuôn nhìn vua (BTC) trước khi ra quyết định với các quan (Altcoin).',
      hashtags: ['#bitcoin', '#altcoin', '#marketcorrelation', '#crypto'],
    },
    {
      content: 'Sell the News (Bán khi tin ra) & HFZ.\n\nThường tin tốt hay ra khi giá đã tăng một đoạn dài và chạm vào HFZ. Tại sao? Để Cá mập xả hàng.\n\nHọ cần một lượng lớn người mua (Fomo theo tin) để khớp hết lượng hàng họ muốn bán. \nNếu thấy tin tốt tràn ngập mặt báo mà giá đang ở HFZ -> Cẩn thận củi lửa. Có thể là đỉnh đấy.\n\nHãy tin vào Chart (Frequency), đừng tin vào News.',
      hashtags: ['#news', '#marketmanipulation', '#HFZ', '#GemTrading'],
    },
    {
      content: 'Đồng bộ khung thời gian (Timeframe Alignment).\n\nSetup hoàn hảo nhất là gì? Là khi các khung thời gian cùng đồng thuận.\n- Khung D1 đang ở LFZ (Vùng Mua).\n- Khung H4 tạo mẫu hình DPU (Đảo chiều tăng).\n- Khung H1 tạo Bull Flag (Tiếp diễn tăng).\n\nKhi các \'tần số\' của các khung thời gian cộng hưởng với nhau, cú trade đó thường sẽ win rất đậm. Hãy kiên nhẫn chờ đợi sự đồng bộ này.',
      hashtags: ['#timeframealignment', '#tradingstrategy', '#highprobability', '#Gemral'],
    },
    {
      content: 'Tinh thần Gemral: Chia sẻ và Cùng tiến.\n\nTrading là một nghề cô đơn. Bạn ngồi một mình với 4 bức tường và cái màn hình. Đó là lý do cộng đồng Gemral ra đời.\n\nỞ đây chúng ta không hô hào kèo (signal), chúng ta chia sẻ kiến thức Frequency Method, chia sẻ cách dùng Tools, và chia sẻ những bài học tâm lý. \n\nHãy cùng nhau xây dựng một cộng đồng Trader văn minh, có kiến thức và kỷ luật. \nChúc anh em một tuần giao dịch Xanh Pips và Tâm An! 💎',
      hashtags: ['#community', '#Gemral', '#tradinglife', '#support'],
    },
    {
      content: 'Mẫu hình số 18: Triangle (Tổng hợp) - Tier 3.\n\nTrong gói Tier 3, Scanner sẽ quét tất cả các loại Tam giác: Tăng, Giảm, Cân. \n\nTam giác thực chất là sự thu hẹp biên độ dao động. Nó giống như một lò xo đang nén lại. \nQuy tắc bất biến: Không đoán hướng phá vỡ. Hãy đợi giá Breakout khỏi tam giác và Retest lại cạnh tam giác (lúc này đóng vai trò là LFZ hoặc HFZ nhỏ) để vào lệnh.\n\nNgười kiên nhẫn sẽ ăn trọn con sóng sau khi lò xo bung ra.',
      hashtags: ['#TrianglePattern', '#Tier3', '#breakout', '#GemTrading'],
    },
    {
      content: 'Volume (Khối lượng) - Máy nói dối hay người phán xử?\n\nTrong Frequency Method, Volume đóng vai trò xác nhận mẫu hình. \n- Một mẫu hình UPU (Up-Pause-Up) có giá trị cao khi nhịp Up đầu tiên có Volume lớn, nhịp Pause Volume giảm dần (cạn cung), và nhịp Up phá vỡ có Volume nổ mạnh.\n- Nếu giá phá vỡ HFZ (Vùng Bán) mà Volume lẹt đẹt, coi chừng đó là Fakeout (Phá vỡ giả).\n\nHãy luôn nhìn Volume để biết \'nội lực\' của cây nến. Nến dài mà Volume thấp thì giống như người khổng lồ chân đất sét, dễ ngã lắm.',
      hashtags: ['#VolumeAnalysis', '#VSA', '#UPU', '#GemTrading'],
    },
    {
      content: 'Quản lý lệnh (Trade Management): Chốt lời từng phần (Scaling out).\n\nĐừng bao giờ chốt hết 100% vị thế tại một điểm, trừ khi đó là HFZ khung Tháng cực mạnh. \nChiến lược khôn ngoan:\n1. Giá chạy được 1R (Lợi nhuận = Rủi ro) -> Dời Stoploss về Entry (Hòa vốn).\n2. Giá chạm HFZ gần nhất -> Chốt 50% túi tiền.\n3. 50% còn lại -> Gồng lời (Let profits run) theo xu hướng hoặc trailing stop.\n\nCách này giúp tâm lý bạn cực kỳ thoải mái. Tiền đã vào túi là tiền của mình, phần còn lại là tiền của thị trường, cứ để nó chạy.',
      hashtags: ['#TakeProfit', '#quanlyvon', '#tradingstrategy', '#crypto'],
    },
    {
      content: 'Overtrading (Giao dịch quá mức) - Căn bệnh của sự rảnh rỗi.\n\nScanner Tier 3 quét ra 24 mẫu hình, không có nghĩa là bạn phải trade tất cả chúng. \nThấy DPU ở M15 cũng vào, thấy Engulfing ở M5 cũng vào... Cuối ngày tổng kết lại chỉ thấy tốn phí sàn (Fee) và lỗ lai rai.\n\nHãy nhớ: \'Less is More\'. Chỉ chọn những setup A+ (xác suất cao nhất). Ví dụ: DPU tại LFZ khung H4 trở lên. Một ngày chỉ cần 1 lệnh chất lượng còn hơn 10 lệnh rác.',
      hashtags: ['#Overtrading', '#qualityoverquantity', '#kyluat', '#Gemral'],
    },
    {
      content: 'Confluence (Sự hợp lưu) - Chìa khóa của Big Trade.\n\nBạn có dám All-in (tất nhiên là vẫn quản lý rủi ro) khi:\n1. Giá chạm LFZ khung Tuần.\n2. Xuất hiện mẫu hình Morning Star (Tier 3).\n3. RSI phân kỳ dương.\n4. Tin tức vĩ mô ủng hộ.\n\nKhi nhiều yếu tố cùng chỉ về một hướng, đó là Confluence. Đó là lúc vũ trụ gửi tín hiệu: \'Múc đi chờ chi\'. Những cơ hội này không nhiều, nhưng khi nó đến, hãy tận dụng triệt để.',
      hashtags: ['#Confluence', '#setup', '#tradingstrategy', '#GemTrading'],
    },
    {
      content: 'Khoảng trống giá (Gap) và Frequency Method.\n\nThị trường Crypto chạy 24/7 nên ít Gap, nhưng thị trường Futures (CME) thì có. Thường thì \'Gap sinh ra là để lấp đầy\'.\n\nTrong hệ quy chiếu của chúng ta, Gap đóng vai trò như một vùng LFZ hoặc HFZ vô hình. \n- Gap tăng: Hoạt động như LFZ. Khi giá quay lại lấp Gap, thường sẽ bật lên.\n- Gap giảm: Hoạt động như HFZ.\n\nĐừng hoảng sợ khi thấy giá rớt mạnh về Gap. Đó có thể là cơ hội để lên tàu đấy.',
      hashtags: ['#GapTrading', '#CME', '#LFZ', '#crypto'],
    },
    {
      content: 'Tâm lý khi \'Bán non\' (Selling too soon).\n\nBạn mua ở đáy, giá tăng 10%, bạn chốt lời. Sau đó giá x10. Cảm giác tiếc nuối này đôi khi còn đau hơn là cắt lỗ.\n\nTại sao bạn bán non? Vì bạn không tin vào phân tích của mình, hoặc bạn nhìn vào số tiền ($) thay vì nhìn vào Chart.\n\nHãy nhìn Chart. Giá đã chạm HFZ chưa? Đã có tín hiệu đảo chiều (Shooting Star, DPD) chưa? Nếu chưa, tại sao lại bán? Hãy để các vùng Tần Số (Frequency Zones) dẫn đường, đừng để nỗi sợ mất lãi điều khiển bạn.',
      hashtags: ['#holdtodie', '#tamlygiao dich', '#HFZ', '#GemTips'],
    },
    {
      content: 'Setup góc làm việc (Trading Desk) - Phong thủy cho Trader.\n\nKhông cần phải 4-5 màn hình như trong phim đâu. Một chiếc laptop, một màn hình phụ, một cuốn sổ nhật ký và... một viên đá thạch anh (để trấn tâm) là đủ.\n\nQuan trọng là không gian phải yên tĩnh, gọn gàng. Sự bừa bộn bên ngoài sẽ dẫn đến sự hỗn loạn bên trong tâm trí. \n\nGóc trading của anh em thế nào? Đơn giản hay \'hầm hố\'? Show ảnh giao lưu nào! 👇',
      hashtags: ['#tradersetup', '#lifestyle', '#phongthuy', '#Gemral'],
    },
    {
      content: 'Falling Wedge - Mẫu hình số 20 (Tier 3) - Bản nâng cấp.\n\nFalling Wedge thường là tín hiệu đảo chiều tăng (Bullish). Nhưng trong Frequency Method, chúng ta soi kỹ hơn:\nWedge đó đang \'chọc\' vào đâu?\n\nNếu mũi nhọn của Falling Wedge kết thúc ngay tại vùng LFZ khung Ngày -> Tỷ lệ thắng lên tới 80-90%.\nNếu Falling Wedge lơ lửng giữa trời -> Cẩn thận Bull Trap.\n\nLuôn luôn là: Context (Bối cảnh) > Pattern (Mẫu hình).',
      hashtags: ['#FallingWedge', '#Tier3', '#LFZ', '#technicalanalysis'],
    },
    {
      content: 'Phân bổ vốn (Portfolio Allocation) cho mùa Uptrend.\n\nĐừng bao giờ bỏ hết trứng vào một giỏ. Công thức tham khảo của mình:\n- 50% vốn: Bitcoin & ETH (An toàn, giữ giá).\n- 30% vốn: Mid Cap (Các nền tảng Layer 1, Layer 2 tiềm năng) - Dùng Frequency Method để tìm điểm vào LFZ khung tuần.\n- 20% vốn: Low Cap / Meme / Trend ngắn hạn (Rủi ro cao, lợi nhuận cao) - Đánh nhanh rút gọn.\n\nGiữ kỷ luật phân bổ này, dù thị trường có sập, bạn vẫn còn 50% trụ cột. Đừng để lòng tham biến bạn thành \'bag holder\' của những đồng coin rác.',
      hashtags: ['#portfolio', '#dautu', '#quanlyvon', '#crypto'],
    },
    {
      content: 'Trading vào cuối tuần (Weekend Trading) - Cạm bẫy thanh khoản thấp.\n\nThứ 7, Chủ nhật thường là lúc các định chế tài chính nghỉ (Bank nghỉ). Volume thị trường Crypto giảm hẳn (Low liquidity).\n\nLúc này, giá rất dễ bị thao túng (Fake pump/dump) bởi cá mập nhỏ lẻ hoặc Bot. Các mẫu hình DPD, UPU hình thành cuối tuần thường ít uy tín hơn (dễ bị false break).\n\nLời khuyên: Cuối tuần nên giảm volume, hoặc tốt nhất là nghỉ ngơi, dành thời gian cho bản thân và gia đình. Thứ 2 đầu tuần trade tiếp, tiền không chạy mất đâu.',
      hashtags: ['#weekend', '#marketliquidity', '#traderlife', '#GemTrading'],
    },
    {
      content: 'Sức mạnh của đường EMA (Exponential Moving Average).\n\nDù Frequency Method tập trung vào Zone và Price Action, nhưng EMA là công cụ hỗ trợ xu hướng tuyệt vời. \n- EMA 34/89: Xác định xu hướng trung hạn.\n- Khi giá hồi về LFZ hợp lưu với đường EMA 34/89 -> Điểm tựa kép.\n\nĐừng để chart quá rối rắm, nhưng 1-2 đường chỉ báo xu hướng sẽ giúp bạn không bị \'say sóng\' khi nhìn nến.',
      hashtags: ['#EMA', '#indicators', '#trending', '#GemTips'],
    },
    {
      content: 'Tư duy \'Thợ săn\' vs \'Con bạc\'.\n\nCon bạc: Vào thị trường tìm cảm giác mạnh. Muốn gỡ gạc nhanh. Vào lệnh liên tục bất kể thị trường xấu đẹp.\nThợ săn: Ngồi im rình mồi. Chờ con mồi (Giá) đi vào bẫy (Zone). Nếu con mồi không vào bẫy -> Không bắn. \n\nBạn đang là ai trong thị trường này? Hãy thành thật với chính mình. Thay đổi tư duy là bước đầu tiên để thay đổi số dư tài khoản.',
      hashtags: ['#mindset', '#hunter', '#gambler', '#Gemral'],
    },
    {
      content: 'Breakout (Phá vỡ) vs. Retest (Kiểm tra lại).\n\nCó hai trường phái vào lệnh:\n1. Aggressive (Hổ báo): Vào ngay khi giá Breakout khỏi mô hình/Zone. Ưu điểm: Không lỡ tàu. Nhược điểm: Dễ dính Fakeout.\n2. Conservative (Thận trọng): Chờ giá Breakout, sau đó quay lại Retest vùng vừa phá. Ưu điểm: An toàn, SL ngắn. Nhược điểm: Đôi khi giá bay luôn không đón.\n\nVới Frequency Method, mình ưu tiên cách 2. Chờ giá Retest lại LFZ (vừa được tạo ra từ cú break) để vào lệnh. Chậm mà chắc.',
      hashtags: ['#Breakout', '#Retest', '#entrystrategy', '#GemTrading'],
    },
    {
      content: 'Mẫu hình số 24: Falling Three Methods (Ôn tập).\n\nHôm nay Scanner Tier 3 báo tín hiệu này trên cặp ETH/USDT khung H4. \nGiá giảm mạnh, sau đó đi ngang 3 cây nến nhỏ (Pause) nằm gọn trong cây nến đỏ trước đó. Đây là dấu hiệu phe Gấu đang nghỉ ngơi uống nước trước khi đạp tiếp.\n\nAnh em nào đang tính bắt đáy ETH thì cẩn thận nhé. Chưa thấy DPU hay LFZ cứng nào đỡ ở dưới đâu.',
      hashtags: ['#FallingThreeMethods', '#ETH', '#marketupdate', '#GemTrading'],
    },
    {
      content: 'Distal Line - Ranh giới của kỷ luật.\n\nTại sao mình luôn nhắc về Distal Line? Vì đó là điểm mà luận điểm giao dịch của bạn sai hoàn toàn. \n\nKhi giá phá vỡ Distal Line của LFZ, nghĩa là phe Mua tại đó đã thua cuộc. Đừng cố tìm lý do để giữ lệnh (ví dụ: \'chắc nó chỉ quét râu thôi\', \'tin tốt sắp ra rồi\'). \n\nChấp nhận sai là một kỹ năng thượng thừa. Cắt lỗ dứt khoát tại Distal Line giúp bạn bảo toàn năng lượng và vốn liếng cho kèo sau.',
      hashtags: ['#DistalLine', '#stoploss', '#discipline', '#crypto'],
    },
    {
      content: 'Tính kiên nhẫn được trả bằng tiền.\n\nWarren Buffett nói rồi, thị trường là nơi chuyển tiền từ túi người nôn nóng sang người kiên nhẫn. \n\nKiên nhẫn chờ setup. \nKiên nhẫn chờ giá về Entry.\nKiên nhẫn gồng lãi đến Target.\n\nCó những tuần mình không vào lệnh nào vì không có setup đẹp. Có sao đâu? Tiền mặt (Cash) cũng là một vị thế. Giữ được tiền là thắng 50% rồi. Anh em tuần này trade mấy lệnh rồi?',
      hashtags: ['#patience', '#tradingwisdom', '#Gemral', '#dautu'],
    },
    {
      content: 'Mối tương quan (Correlation) giữa BTC và thị trường chứng khoán Mỹ (SPX/NASDAQ).\n\nCrypto không còn là ốc đảo độc lập. Nó chịu ảnh hưởng lớn từ kinh tế vĩ mô.\nKhi SPX sập, BTC khó mà bay ngược gió. \n\nTrước khi trade, hãy ngó qua chart SP500 và DXY (Sức mạnh đồng Đô la). \n- DXY tăng mạnh tại LFZ -> Cẩn thận, tài sản rủi ro như Crypto dễ sấp mặt.\n- DXY chạm HFZ và giảm -> Crypto dễ thở, to the moon.\n\nTrading là nhìn rộng ra thế giới, đừng chỉ cắm mặt vào mỗi chart coin.',
      hashtags: ['#macro', '#DXY', '#SPX', '#marketcorrelation'],
    },
    {
      content: 'Review lệnh thắng: May mắn hay Kỹ năng?\n\nThắng một lệnh đừng vội mừng. Hãy xem lại:\n- Mình thắng vì đúng phân tích Frequency Method?\n- Hay mình thắng vì \'chó ngáp phải ruồi\', vào bừa rồi thị trường pump?\n\nNếu thắng do may mắn, sớm muộn gì bạn cũng trả lại hết cho thị trường. Nếu thắng do tuân thủ quy trình, hãy tự thưởng cho mình (nhưng đừng tự mãn). \nSự nhất quán (Consistency) mới là đích đến.',
      hashtags: ['#review', '#consistency', '#tradingjourney', '#GemTrading'],
    },
    {
      content: 'Quản lý thời gian cho Part-time Trader.\n\nĐa số anh em Gemral đều có công việc chính. Làm sao để trade hiệu quả?\n1. Trade khung lớn (H4, D1): Tín hiệu ít nhưng chất lượng, không cần canh nhiều.\n2. Dùng Alert Bot (Tier 1): Đặt cảnh báo tại Proximal Line của các vùng HFZ/LFZ quan trọng.\n3. Vào lệnh Limit: Đặt sẵn lệnh chờ, SL, TP rồi đi làm việc.\n\nĐừng để trading ảnh hưởng đến công việc chính. Hãy để nó là nguồn thu nhập thứ 2 vui vẻ.',
      hashtags: ['#parttimetrader', '#worklifebalance', '#efficiency', '#GemTips'],
    },
    {
      content: 'Câu hỏi cuối ngày: Bạn sợ mất tiền hay sợ mất cơ hội?\n\n- Sợ mất cơ hội (FOMO) -> Dẫn đến vào lệnh ẩu, đu đỉnh.\n- Sợ mất tiền -> Dẫn đến chốt non, không dám vào lệnh.\n\nCả hai nỗi sợ đều không tốt. Trạng thái tốt nhất là \'Trung dung\' - Vô vi. \nNhìn thị trường như nó vốn là. Có sóng thì lướt, không sóng thì nghỉ. Mất tiền trong kế hoạch thì coi như chi phí kinh doanh. \n\nChúc anh em một buổi tối an lành và giữ cái đầu lạnh! 🧘‍♂️',
      hashtags: ['#tamly', '#tradingmindset', '#balance', '#Gemral'],
    },
    {
      content: 'Fibonacci & LFZ - Cặp đôi hoàn hảo.\n\nNhiều anh em hỏi: \'Làm sao biết giá hồi về đâu thì bật lên?\'. Câu trả lời nằm ở sự hợp lưu (Confluence).\n\nHãy kẻ Fibonacci Retracement từ đáy lên đỉnh con sóng. Nếu mức Fibo vàng (0.5 - 0.618) trùng khớp với một vùng LFZ (Vùng Mua) cũ, đó là \'Golden Zone\'.\n\nTại đây, phe Mua theo trường phái Fibo và phe Mua theo trường phái Frequency Method sẽ cùng hành động. Lực mua cộng hưởng sẽ tạo ra cú bật cực mạnh. Đừng bỏ qua sự hợp lưu này nhé!',
      hashtags: ['#Fibonacci', '#LFZ', '#confluence', '#GemTrading'],
    },
    {
      content: 'Piercing Line (Nến Xuyên) - Mẫu hình đảo chiều tại LFZ.\n\nĐây là một biến thể nhẹ nhàng hơn của Engulfing (Nhấn chìm). \nCấu trúc: Nến 1 đỏ dài. Nến 2 mở cửa thấp hơn giá thấp nhất của nến 1 (Gap giảm), nhưng sau đó phe Mua đẩy giá lên và đóng cửa trên 50% thân nến 1.\n\nĐiều kiện tiên quyết: Mẫu hình này PHẢI xuất hiện tại LFZ (Vùng Mua). Nó cho thấy phe Bán cố gắng đẩy giá xuống lần cuối nhưng thất bại. Đây là tín hiệu sớm để canh Buy.',
      hashtags: ['#PiercingLine', '#Tier3', '#nenNhat', '#GemTips'],
    },
    {
      content: 'Dark Cloud Cover (Mây Đen Bao Phủ) - Cẩn thận tại HFZ.\n\nNgược lại với Nến Xuyên, Mây Đen Bao Phủ xuất hiện tại đỉnh xu hướng tăng. \nNến 1 xanh mạnh. Nến 2 mở cửa tạo Gap tăng (dụ Fomo), nhưng kết phiên lại bị đạp xuống đóng cửa dưới 50% thân nến xanh trước đó.\n\nNếu bạn thấy mô hình này ngay tại HFZ (Vùng Bán), hãy cẩn trọng. Phe Gấu đang bắt đầu kiểm soát bầu trời. Chốt lời hoặc chuẩn bị \'Short\'.',
      hashtags: ['#DarkCloudCover', '#Tier3', '#HFZ', '#bearish'],
    },
    {
      content: 'RSI Phân kỳ (Divergence) & Frequency Method.\n\nChỉ báo RSI là công cụ dò tìm sự suy yếu của xu hướng cực tốt.\n- Giá tạo đỉnh sau cao hơn đỉnh trước (Higher High), nhưng RSI tạo đỉnh sau thấp hơn (Lower High) -> Phân kỳ Âm (Bearish Divergence).\n\nNếu Phân kỳ Âm xuất hiện ngay khi giá chạm HFZ -> Tỷ lệ đảo chiều giảm lên tới 90%. \nĐừng trade phân kỳ giữa đồng không mông quạnh. Hãy trade phân kỳ tại Zone.',
      hashtags: ['#RSI', '#Divergence', '#tradingstrategy', '#GemTrading'],
    },
    {
      content: 'Drawdown (Mức sụt giảm tài khoản) - Bài toán hồi phục.\n\nBạn có biết: \n- Lỗ 10% cần lãi 11% để về bờ.\n- Lỗ 20% cần lãi 25%.\n- Lỗ 50% cần lãi 100%!\n\nĐó là lý do tại sao việc cắt lỗ (Stoploss) tại Distal Line là sống còn. Để lỗ quá sâu, áp lực tâm lý khi gỡ lại là cực lớn. Hãy giữ Drawdown ở mức thấp nhất có thể (dưới 5-10%). Trong trading, giữ tiền quan trọng hơn kiếm tiền.',
      hashtags: ['#Drawdown', '#maths', '#quanlyvon', '#Gemral'],
    },
    {
      content: 'Tweezer Top / Tweezer Bottom (Đỉnh Nhíp / Đáy Nhíp).\n\nMô hình này gồm 2 cây nến có râu dài bằng nhau, chọc về cùng một hướng.\n- Tweezer Bottom tại LFZ: 2 lần phe Bán cố đục thủng sàn nhưng đều bị bật lại tại cùng một mức giá. Sàn cứng -> Buy.\n- Tweezer Top tại HFZ: 2 lần phe Mua húc đầu vào trần nhà và thất bại. Trần cứng -> Sell.\n\nScanner Tier 3 sẽ giúp bạn phát hiện những cặp nhíp này. Đơn giản nhưng hiệu quả.',
      hashtags: ['#TweezerTop', '#TweezerBottom', '#Tier3', '#priceaction'],
    },
    {
      content: 'Cạm bẫy của sự tự tin thái quá (Overconfidence).\n\nSau một chuỗi thắng (Winning streak) 5-6 lệnh liên tiếp, bạn bắt đầu nghĩ mình là \'Thần Trade\'. Bạn bắt đầu coi thường thị trường, bỏ qua việc check Zone, tăng volume bừa bãi.\n\nBùm! Một lệnh thua xóa sạch thành quả của cả tháng. \n\nKhi bạn thấy hưng phấn nhất, hãy tắt máy đi ngủ. Đừng để cái tôi (Ego) che mờ kỷ luật. Hãy luôn nhớ: \'Chúng ta chỉ là những con cá nhỏ nương theo dòng nước\'.',
      hashtags: ['#tamlytrading', '#khiemton', '#mindset', '#GemTrading'],
    },
    {
      content: 'Three White Soldiers (Ba Chàng Lính Ngự Lâm).\n\nBa cây nến xanh liên tiếp với thân dài, râu ngắn, đóng cửa gần mức cao nhất. Mẫu hình số 24 (biến thể tăng) trong Tier 3.\n\nĐây là dấu hiệu của dòng tiền lớn đổ vào ồ ạt. Nếu nó xuất hiện sau một giai đoạn tích lũy dài tại LFZ, đó là khởi đầu của một Uptrend mạnh mẽ. Đừng chặn đầu xe tăng, hãy nhảy lên xe.',
      hashtags: ['#ThreeWhiteSoldiers', '#bullrun', '#Tier3', '#crypto'],
    },
    {
      content: 'Three Black Crows (Ba Con Quạ Đen).\n\nNgược lại với ba chàng lính, ba con quạ đen là 3 nến đỏ dài liên tiếp giảm mạnh. \n\nNếu nó xuất hiện sau một đợt tăng giá dài và bắt đầu từ HFZ, đó là dấu hiệu của sự sụp đổ (Crash). Phe Mua đã hoàn toàn buông xuôi. Thoát hàng ngay khi còn có thể.',
      hashtags: ['#ThreeBlackCrows', '#bearish', '#Tier3', '#GemTips'],
    },
    {
      content: 'Inside Bar (Nến Trong Nến) - Sự nén giá.\n\nInside Bar là một mẫu hình \'Pause\' kinh điển nằm trong Tier 3. \nCấu trúc: Một nến Mẹ (Mother bar) bao trùm toàn bộ nến Con (Inside bar) phía sau.\n\nNó thể hiện thị trường đang tạm nghỉ, nén lại. \n- Nếu phá vỡ Mother Bar theo chiều lên -> UPU (tiếp diễn tăng).\n- Nếu phá vỡ Mother Bar theo chiều xuống -> DPD (tiếp diễn giảm).\n\nInside Bar tại LFZ/HFZ thường báo hiệu một cú nổ lớn sắp xảy ra.',
      hashtags: ['#InsideBar', '#Tier3', '#volatility', '#GemTrading'],
    },
    {
      content: 'Chiến thuật Scaling In (Nhồi lệnh dương).\n\nĐừng bao giờ trung bình giá xuống (gồng lỗ). Hãy trung bình giá lên (gồng lãi).\n\nVí dụ: \n1. Vào lệnh 1 tại LFZ. Giá chạy đúng hướng.\n2. Giá phá vỡ một cản nhỏ và tạo UPU mới -> Vào thêm lệnh 2.\n3. Dời SL của lệnh 1 và đặt SL lệnh 2 tại điểm hòa vốn mới.\n\nNếu đúng, bạn ăn trọn con sóng với volume lớn. Nếu sai, bạn hòa vốn hoặc lãi nhẹ. Đây là cách các phù thủy tài chính kiếm triệu đô.',
      hashtags: ['#ScalingIn', '#pyramiding', '#chienthang', '#Gemral'],
    },
    {
      content: 'Sức khỏe và Trading.\n\nBạn không thể có những quyết định sáng suốt với một cơ thể mệt mỏi và cái đầu thiếu oxy.\n\nNgồi máy tính quá lâu gây đau lưng, mỏi mắt, stress. Hãy áp dụng quy tắc 20-20-20 (mắt) và đứng dậy đi lại mỗi 60 phút.\n\nMột cơ thể khỏe mạnh chứa đựng một tâm trí minh mẫn. Tập gym, yoga, thiền... là những khoản đầu tư siêu lợi nhuận cho sự nghiệp trading của bạn.',
      hashtags: ['#health', '#traderlifestyle', '#balance', '#Gemral'],
    },
    {
      content: 'Marubozu (Nến Cường Lực) - Sự dứt khoát.\n\nNến Marubozu là nến thân dài, không có râu (hoặc râu cực ngắn). \n- Marubozu Xanh: Phe Mua áp đảo hoàn toàn từ mở cửa đến đóng cửa.\n- Marubozu Đỏ: Phe Bán tàn sát.\n\nNếu Marubozu Xanh phá vỡ HFZ (Vùng Bán), vùng đó chính thức bị vô hiệu hóa và chuyển thành LFZ (Vùng Mua) mới. Đây là tín hiệu Breakout uy tín nhất.',
      hashtags: ['#Marubozu', '#priceaction', '#breakout', '#GemTrading'],
    },
    {
      content: 'Phiên giao dịch (Trading Sessions) - Khi nào sóng to?\n\nThị trường Crypto chạy 24/7, nhưng thanh khoản không đều.\n- Phiên Á (Sáng): Thường đi ngang hoặc theo xu hướng cũ.\n- Phiên Âu (Chiều): Bắt đầu sôi động, hay có Fakeout.\n- Phiên Mỹ (Tối): Sóng to gió lớn, tin tức ra nhiều.\n\nNếu bạn thích biến động mạnh (Scalping), hãy canh phiên Mỹ. Nếu thích êm đềm (Swing), phiên Á là lựa chọn tốt. Hãy chọn khung giờ phù hợp với phong cách sống của bạn.',
      hashtags: ['#tradingsession', '#time', '#marketstructure', '#crypto'],
    },
    {
      content: 'Paper Trading (Giao dịch trên giấy) - Bước đệm cần thiết.\n\nTrước khi nạp tiền thật, hãy thử Demo hoặc Paper Trading với hệ thống Frequency Method.\n\nHãy coi số tiền ảo đó là tiền thật. Tuân thủ kỷ luật 100%. \nNếu bạn không thể kiếm lãi trên Demo, đừng mơ kiếm lãi trên tài khoản thật. Thị trường thật còn có thêm áp lực tâm lý mất tiền nữa. Hãy luyện tập cho thuần thục Scanner và các mẫu hình trước nhé.',
      hashtags: ['#PaperTrading', '#demo', '#learning', '#Gemral'],
    },
    {
      content: 'Tin tức và Nhiễu loạn (Noise).\n\n\'Elon Musk tweet về Doge\', \'FED tăng lãi suất\', \'Sàn X bị hack\'...\nNgày nào cũng có hàng tấn tin tức. Nếu bạn trade theo tin, bạn sẽ bị xoay như chong chóng.\n\nHãy nhớ: Biểu đồ (Chart) phản ánh tất cả. Cá mập biết tin trước bạn, họ đã hành động và để lại dấu vết trên Chart (tạo HFZ/LFZ, tạo Volume). \n\nLà một Gem Trader, hãy tập trung vào Tần Số (Frequency), bỏ qua Tiếng Ồn (Noise).',
      hashtags: ['#news', '#noise', '#focus', '#GemTrading'],
    },
    {
      content: 'Spinning Top (Con Xoay) - Mẫu hình số 27 (biến thể).\n\nThân nến nhỏ, hai râu dài bằng nhau. Nó cho thấy sự lưỡng lự. Phe Mua đẩy lên, phe Bán đạp xuống, cuối cùng hòa nhau.\n\nSpinning Top xuất hiện giữa xu hướng -> Tiếp diễn.\nSpinning Top xuất hiện tại Zone -> Cảnh báo đảo chiều.\n\nNó giống như đèn vàng giao thông: \'Đi chậm lại, quan sát\'. Đừng vội vào lệnh khi thấy con xoay, hãy đợi nến xác nhận sau đó.',
      hashtags: ['#SpinningTop', '#Tier3', '#indecision', '#technicalanalysis'],
    },
    {
      content: 'Winrate (Tỷ lệ thắng) vs. R:R (Risk:Reward) - Cán cân lợi nhuận.\n\nBạn không cần Winrate 90% để giàu. \nVới R:R = 1:2, bạn chỉ cần Winrate 35% là đã hòa vốn. Winrate 50% là bạn siêu giàu.\n\nĐừng ám ảnh việc phải đúng mọi lúc. Hãy tập trung tìm kiếm những kèo có R:R tốt (LFZ đẹp, khoảng trống tăng giá rộng). Chấp nhận thua những lệnh nhỏ để thắng những lệnh lớn.',
      hashtags: ['#maths', '#profitability', '#tuduy', '#Gemral'],
    },
    {
      content: 'Market Structure Break (MSB) - Sự gãy cấu trúc.\n\nTrong xu hướng tăng, giá tạo Đỉnh sau cao hơn Đỉnh trước, Đáy sau cao hơn Đáy trước.\nKhi giá phá vỡ Đáy gần nhất (Lower Low) -> MSB. Cấu trúc tăng đã gãy.\n\nKết hợp Frequency Method: Khi giá chạm HFZ khung lớn + xuất hiện MSB ở khung nhỏ -> Đó là thời điểm vàng để Short. Sự đồng thuận giữa Cấu trúc và Vùng giá là tín hiệu cực mạnh.',
      hashtags: ['#MSB', '#marketstructure', '#HFZ', '#GemTips'],
    },
    {
      content: 'Tổng kết cuối tuần: Bạn đã tốt hơn tuần trước chưa?\n\nĐừng so sánh PnL (lời lỗ) của mình với người khác trên mạng. Hãy so sánh với chính mình tuần trước.\n- Tuần này mình có tuân thủ kỷ luật hơn không?\n- Mình có FOMO lệnh nào không?\n- Mình có sử dụng đúng các mẫu hình Tier 2, Tier 3 không?\n\nTrading là hành trình tu sửa bản thân. Tiền bạc chỉ là phần thưởng cho sự trưởng thành đó. Chúc anh em cuối tuần thư thái! 🌿',
      hashtags: ['#selfreflection', '#growth', '#betterversion', '#Gemral'],
    },
    {
      content: 'Liquidity Pools (Hồ thanh khoản) & Bẫy giá.\n\nThị trường luôn tìm về nơi có thanh khoản. Nơi nào có nhiều Stoploss của đám đông nhất, giá sẽ tìm về đó.\n\nThường thì ngay trên đỉnh HFZ và ngay dưới đáy LFZ là nơi tập trung SL nhiều nhất. Cá mập sẽ đẩy giá quét qua đó (Liquidity Grab) trước khi đảo chiều thật sự.\n\nGem Trader khôn ngoan sẽ không đặt SL quá sát. Hãy cho thị trường không gian để thở (Breathing room). Đôi khi, chờ một cú quét thanh khoản (Sweep) xong rồi mới vào lệnh lại là an toàn nhất.',
      hashtags: ['#Liquidity', '#marketstructure', '#smartmoney', '#GemTrading'],
    },
    {
      content: 'Trading là tấm gương phản chiếu nội tâm.\n\nNếu bạn là người nóng nảy ngoài đời, bạn sẽ fomo trong trading.\nNếu bạn là người thiếu quyết đoán, bạn sẽ không dám vào lệnh tại LFZ đẹp.\nNếu bạn tham lam, bạn sẽ không bao giờ chốt lời.\n\nSửa mình trước khi sửa lệnh. Khi tâm tính bạn thay đổi, nhu hòa hơn, kỷ luật hơn, tự nhiên PnL (Profit and Loss) sẽ xanh. Đó là lý do tại sao Gemral kết hợp Trading với Tu tập.',
      hashtags: ['#tamly', '#selfdevelopment', '#tradingislife', '#Gemral'],
    },
    {
      content: 'Tuyệt đối KHÔNG Martingale (Gấp thếp).\n\nThua 1 lệnh, lệnh sau đánh gấp đôi để gỡ? Đừng dại dột. Đây là cách nhanh nhất để cháy tài khoản.\n\nTrong Frequency Method, mỗi setup độc lập với nhau. Lệnh trước thua không có nghĩa là lệnh sau xác suất thắng cao hơn. Hãy giữ rủi ro ổn định (ví dụ 1-2% vốn/lệnh). \nThị trường có thể vô lý lâu hơn khả năng chịu đựng của túi tiền bạn.',
      hashtags: ['#Martingale', '#quanlyvon', '#tuduycobac', '#GemTips'],
    },
    {
      content: 'Tính chất Fractal (Phân hình) của thị trường.\n\nThị trường có tính lặp lại ở mọi khung thời gian. Một mẫu hình DPD (Down-Pause-Down) ở khung Tháng cũng y hệt DPD ở khung 1 Phút.\n\nĐiều này có nghĩa là gì? Nghĩa là phương pháp Frequency Method áp dụng được cho mọi loại trader: từ Scalper (lướt sóng ngắn) đến Holder (nắm giữ dài hạn).\nQuan trọng là bạn chọn \'bể bơi\' nào phù hợp với sức mình thôi.',
      hashtags: ['#Fractal', '#technicalanalysis', '#scalping', '#swingtrading'],
    },
    {
      content: 'Mẫu hình số 19: Flag Pattern (Mô hình Cờ) - Tier 3.\n\nĐây là mẫu hình tiếp diễn xu hướng rất đáng tin cậy. \n- Cán cờ: Giai đoạn giá chạy mạnh (Impulse).\n- Lá cờ: Giai đoạn giá nghỉ ngơi, đi ngang hoặc hồi nhẹ (Correction/Pause).\n\nKhi giá phá vỡ Lá cờ, chúng ta kỳ vọng một nhịp tăng/giảm bằng chiều dài cán cờ. Tier 3 Scanner sẽ giúp bạn bắt trọn những con sóng tiếp diễn này mà không cần canh bảng.',
      hashtags: ['#FlagPattern', '#Tier3', '#trendfollowing', '#GemTrading'],
    },
    {
      content: 'Đa dạng hóa danh mục (Diversification) - Không chỉ có Crypto.\n\nMột nhà đầu tư thịnh vượng không nên giữ 100% tài sản trong Crypto. \nHãy dùng lãi từ Crypto để:\n- Mua vàng (Trữ giá trị).\n- Mua đất (Bất động sản).\n- Đầu tư kiến thức (Khóa học, sách).\n- Làm từ thiện (Gieo hạt).\n\nCrypto là kênh tăng trưởng (Growth), nhưng rủi ro cao. Hãy xây dựng một tháp tài sản vững chắc.',
      hashtags: ['#taichinhcanhan', '#assetallocation', '#thinhvuong', '#Gemral'],
    },
    {
      content: 'Ngủ ngon là chỉ báo quan trọng nhất.\n\nNếu bạn vào một lệnh mà tối không ngủ được, cứ chập chờn check điện thoại -> Bạn đã đi volume quá to (Overleverage).\n\nHãy giảm volume xuống mức mà dù có bị Stoploss, bạn vẫn mỉm cười đi ngủ. Giấc ngủ ngon đáng giá hơn mọi khoản lợi nhuận. Tâm an thì trí mới sáng.',
      hashtags: ['#sleep', '#riskmanagement', '#mentalhealth', '#GemTips'],
    },
    {
      content: 'Cảnh báo Scam (Lừa đảo) trong Crypto.\n\nThị trường này đầy rẫy cạm bẫy: Sàn fake, Dự án bánh vẽ, Link phishing...\nNguyên tắc của Gemral:\n1. Không bao giờ gửi tiền cho người lạ hứa hẹn lãi suất cao.\n2. Không click link lạ.\n3. Luôn double-check địa chỉ ví.\n4. Chỉ tin vào kiến thức của chính mình.\n\nTiền trong túi mình là của mình. Tiền trong túi người khác (ủy thác) là rủi ro.',
      hashtags: ['#scamalert', '#security', '#safety', '#crypto'],
    },
    {
      content: 'Gieo hạt tài chính (Giving back).\n\nCó một quy luật vũ trụ: Dòng chảy thịnh vượng phải được luân chuyển. Khi bạn kiếm được tiền từ thị trường (Take profit), hãy trích một phần nhỏ (5-10%) để làm việc thiện, giúp đỡ cộng đồng.\n\nViệc này không chỉ giúp ích cho xã hội mà còn giúp tâm lý bạn thoải mái, không bị dính mắc vào lòng tham, và \'xả\' bớt áp lực. Phước báu sẽ bảo vệ tài khoản của bạn theo cách vô hình.',
      hashtags: ['#gieohat', '#charity', '#karma', '#Gemral'],
    },
    {
      content: 'Hanging Man (Người Treo Cổ) - Mẫu hình số 26 (Tier 3).\n\nMột cây nến thân nhỏ, râu dưới dài, xuất hiện sau một đợt tăng giá. \nNhiều người nhầm nó với nến Búa (Hammer). Khác biệt ở chỗ vị trí: Búa ở đáy, Người Treo Cổ ở đỉnh.\n\nKhi thấy Hanging Man tại HFZ, đó là cảnh báo: Phe Bán đang bắt đầu thử thách sức mạnh của phe Mua. Nếu cây nến sau đó là nến đỏ giảm -> Xác nhận đảo chiều. Chạy ngay đi!',
      hashtags: ['#HangingMan', '#Tier3', '#reversal', '#GemTrading'],
    },
    {
      content: 'Chờ nến đóng cửa (Candle Close) - Quy tắc sống còn.\n\nTrong khung H4, phút thứ 3:59 nến vẫn là cây Marubozu xanh lè phá đỉnh. Phút thứ 4:00 đóng nến tụt xuống thành cây Pinbar râu dài (Fakeout).\n\nNếu bạn vào lệnh khi nến chưa đóng cửa, bạn đang đánh cược với may rủi. Luôn luôn chờ nến đóng cửa để xác nhận tín hiệu từ Scanner. Chậm một giây, chắc cả đời.',
      hashtags: ['#candleclose', '#confirmation', '#patience', '#GemTips'],
    },
    {
      content: 'Kế hoạch B (Plan B).\n\nTrước khi vào lệnh, luôn tự hỏi: \'Nếu giá chạm Stoploss, mình sẽ làm gì?\'.\n- Sẽ đóng máy nghỉ ngơi?\n- Hay sẽ tìm cơ hội vào lại (Re-entry) nếu setup vẫn còn đẹp?\n\nĐừng để bị động. Khi kịch bản xấu xảy ra, bạn chỉ cần hành động theo Plan B đã vạch sẵn, không hoảng loạn, không tiếc nuối.',
      hashtags: ['#PlanB', '#chuanbi', '#tradingplan', '#Gemral'],
    },
    {
      content: 'Không gian Trading & Âm nhạc tần số.\n\nBạn có biết âm nhạc tần số (432Hz, 528Hz) giúp não bộ tập trung và bình tĩnh hơn không? \nThử bật nhạc sóng Alpha nhẹ nhàng khi phân tích chart. Đốt thêm chút trầm hương hoặc tinh dầu để thanh lọc không khí.\n\nTrading không chỉ là việc của cái đầu, mà là sự hòa hợp của cả thân - tâm - trí. Môi trường tốt sinh ra quyết định tốt.',
      hashtags: ['#music', '#frequency', '#focus', '#GemLifestyle'],
    },
    {
      content: 'Tự động hóa với Alert Bot (Tier 1).\n\nĐừng dán mắt vào màn hình. Hãy để Bot làm việc. \nSet cảnh báo tại các vùng Proximal Line quan trọng. Khi điện thoại báo, mở ra xem phản ứng giá (Price Action).\n- Nếu có mẫu hình đảo chiều -> Vào lệnh.\n- Nếu giá xuyên thủng -> Bỏ qua.\n\nĐây là cách trade nhàn hạ của những người thành công.',
      hashtags: ['#AlertBot', '#Tier1', '#automation', '#GemTrading'],
    },
    {
      content: 'May mắn vs. Năng lực.\n\nTrong ngắn hạn, bạn có thể kiếm tiền nhờ may mắn. Nhưng trong dài hạn (5-10 năm), chỉ có năng lực và hệ thống giao dịch (Frequency Method) mới giữ được tiền.\n\nĐừng tự hào vì ăn được một kèo xổ số (Meme coin). Hãy tự hào vì bạn đã tuân thủ kỷ luật trong 100 lệnh liên tiếp. Đó mới là đẳng cấp.',
      hashtags: ['#skill', '#luck', '#longterm', '#Gemral'],
    },
    {
      content: 'Chốt lời không bao giờ sai.\n\n\'Lãi trên giấy\' (Unrealized PnL) chỉ là con số ảo. Tiền về ví (Realized PnL) mới là tiền thật.\nĐừng tham lam muốn ăn trọn từ gốc đến ngọn. Cá ăn thân, đầu đuôi bỏ. \nKhi đạt target, hãy chốt lời. Dùng tiền đó mua quà cho bản thân, gia đình. Đó là cách bạn hiện thực hóa thành quả lao động và tạo động lực cho tiềm thức.',
      hashtags: ['#takeprofit', '#enjoylife', '#reward', '#crypto'],
    },
    {
      content: 'Học từ cộng đồng Gemral.\n\nĐừng đi một mình. Hãy chia sẻ chart của bạn lên nhóm. Hãy xem góc nhìn của người khác.\nCó thể bạn đang Bias (thiên kiến) phe Mua, nhưng người khác lại thấy tín hiệu phe Bán tại HFZ.\n\nSự phản biện văn minh giúp chúng ta nhìn ra điểm mù của chính mình. Cùng nhau học, cùng nhau giàu.',
      hashtags: ['#community', '#learning', '#sharing', '#Gemral'],
    },
    {
      content: 'Tầm nhìn 10 năm.\n\nĐừng nhìn Crypto như kênh lướt sóng kiếm tiền chợ. Hãy nhìn nó như một cuộc cách mạng tài chính.\nBạn đang ở giai đoạn sơ khai của Internet những năm 90. \n\nHãy tích lũy tài sản (Bitcoin, ETH) bằng phương pháp Frequency Method. 10 năm nữa, bạn sẽ cảm ơn bản thân vì sự kiên định ngày hôm nay.',
      hashtags: ['#vision', '#future', '#blockchain', '#dautu'],
    },
    {
      content: 'Biết ơn thị trường.\n\nDù hôm nay thắng hay thua, hãy biết ơn thị trường.\n- Biết ơn vì thị trường cho ta cơ hội kiếm tiền tự do.\n- Biết ơn vì những bài học (thua lỗ) giúp ta trưởng thành.\n\nThái độ biết ơn (Gratitude) tạo ra trường năng lượng thịnh vượng. Người hay oán trách thị trường thường là người thua cuộc.',
      hashtags: ['#gratitude', '#longbieton', '#mindset', '#Gemral'],
    },
  ],
  crystal: [
    {
      content: 'Có ai từng cảm thấy mình đang \"mắc kẹt\" trong một vòng lặp công việc nhàm chán không? 😫 Sáng đi làm, tối về ngủ, ngày nào cũng như ngày nào. Cảm giác thiếu động lực kinh khủng.\n\nMình đã thử đặt một cụm **Kim Linh Thạch** (Thạch anh vàng) ngay góc bàn làm việc. Không phải mê tín đâu nha, nhưng từ ngày có em ấy, tự nhiên thấy đầu óc sáng hơn hẳn. Màu vàng của **Kim Linh Thạch** như một nguồn năng lượng mặt trời thu nhỏ vậy, nhìn vào là thấy phấn chấn. \n\nNó nhắc nhở mình về sự thịnh vượng và mục tiêu tài chính mình đang hướng tới. Ai đang cần một chút \"lửa\" cho sự nghiệp thì thử kết duyên với em này xem sao nhé! ✨',
      hashtags: ['#kimlinhthach', '#thachanhvang', '#dongluc', '#su nghiep', '#gemral'],
    },
    {
      content: '🌸 Chuyện tình cảm đôi khi không cần quá ồn ào, chỉ cần bình yên là đủ.\n\nNếu bạn đang tìm kiếm một sự kết nối sâu sắc hơn, hoặc đơn giản là muốn chữa lành những tổn thương cũ, hãy thử để **Duyên Khởi Thạch** (Thạch anh hồng) bên cạnh giường ngủ. \n\nMình gọi nó là \"viên đá của những khởi đầu mới\". Năng lượng dịu dàng của **Duyên Khởi Thạch** giúp làm mềm những trái tim đang xơ cứng, mở lòng đón nhận yêu thương. Không nhất thiết là tình yêu đôi lứa, mà quan trọng nhất là tình yêu với chính bản thân mình. Khi bạn biết yêu mình, vũ trụ sẽ gửi đến những người biết trân trọng bạn. 💕',
      hashtags: ['#duyenkhoithach', '#thachanhhong', '#selflove', '#tinhyeu', '#healing'],
    },
    {
      content: 'Góc nhỏ bình yên của mình mỗi tối thứ 6: Đốt một chút nến thơm, bật nhạc thiền nhẹ nhàng và ngắm nhìn **Dạ Minh Châu** (Quả cầu Thạch anh tím). 🌌\n\nTrong phong thủy, hình cầu tượng trưng cho sự trọn vẹn, viên mãn. Còn thạch anh tím lại là bậc thầy của trực giác và tâm linh. Đặt **Dạ Minh Châu** trong phòng khách không chỉ sang trọng mà còn giúp thanh lọc trường khí, xua tan căng thẳng sau một tuần dài.\n\nCảm giác như mọi lo toan đều bị hút vào vũ trụ bao la trong viên đá ấy vậy. Ai team tím mộng mơ điểm danh nào! 🙋‍♀️',
      hashtags: ['#daminhchau', '#thachanhtim', '#thien', '#binhyen', '#weekendvibes'],
    },
    {
      content: '🔥 **Huyền Linh - Nhẫn Tay Thần Chú OM**: Khi trang sức không chỉ để đẹp.\n\nĐã bao giờ bạn cảm thấy bất an khi đi đến những nơi lạ, hay gặp những người mang năng lượng tiêu cực? Chiếc nhẫn **Huyền Linh** này được làm từ Hematite - một loại đá có khả năng hộ thân cực mạnh.\n\nKhắc trên đó là thần chú OM - âm thanh nguyên thủy của vũ trụ. Đeo nó trên tay như một lời nhắc nhở bản thân luôn giữ tâm định, không bị xao động bởi ngoại cảnh. Vừa cá tính, vừa an tâm. Một món đồ \"must-have\" cho những ai hay phải di chuyển nhiều nè. 🛡️',
      hashtags: ['#huyenlinh', '#hematite', '#om', '#baove', '#trangsucphongthuy'],
    },
    {
      content: '🌿 Cây nào rồi cũng cần gốc rễ vững chắc. Tài lộc cũng vậy.\n\nGiới thiệu với cả nhà **Bát Nhã Phù Sinh - Cây Thịnh Vượng**. Khác với những cây tài lộc thông thường, em này được kết tinh từ những viên thạch anh vàng chất lượng nhất. \n\nĐặt **Bát Nhã Phù Sinh** ở cung tài lộc (hướng Đông Nam) của ngôi nhà, bạn đang gửi một tín hiệu mạnh mẽ đến vũ trụ: \"Tôi sẵn sàng đón nhận sự sung túc\". Nhìn những tán cây vàng rực rỡ, tự nhiên thấy có động lực cày cuốc hơn hẳn các bác ạ! 😂💰',
      hashtags: ['#batnhaphusinh', '#caythinhvuong', '#thachanhvang', '#phongthuy', '#tailoc'],
    },
    {
      content: 'Có những ngày chỉ muốn trốn cả thế giới... 🌧️\n\nNhững lúc như vậy, mình thường tìm đến **Lôi Phong Thạch** (Trụ đá Khói Xám). Màu khói xám trầm mặc, bí ẩn nhưng lại có khả năng \"grounding\" (tiếp đất) cực tốt. \n\nKhi bạn cảm thấy bay bổng quá đà, hoặc lo âu vô cớ, hãy thử chạm tay vào **Lôi Phong Thạch**. Năng lượng của nó sẽ giúp bạn quay về thực tại, bình tĩnh và vững chãi hơn. Nó như một người bạn trầm tính nhưng luôn ở đó, lặng lẽ lắng nghe và chuyển hóa nỗi buồn giúp bạn.',
      hashtags: ['#loiphongthach', '#thachanhkhoi', '#grounding', '#healing', '#tamtrang'],
    },
    {
      content: '✨ Combo quyền lực cho dân kinh doanh: **Set Ngự Linh Thạch** ✨\n\nTại sao phải chọn lẻ tẻ khi bạn có thể sở hữu trọn bộ năng lượng? **Set Ngự Linh Thạch** là sự kết hợp hoàn hảo của các tinh thể được tuyển chọn kỹ lưỡng để bổ trợ cho nhau.\n\nThạch anh trắng để thanh lọc, thạch anh vàng để hút tài lộc, thạch anh tím để tăng trực giác... Tất cả nằm gọn trong một set, tạo nên một trường năng lượng bảo vệ và thu hút cực mạnh. \n\nĐặt bộ này trên bàn làm việc hoặc quầy thu ngân thì cứ gọi là \"chân ái\". Khách đến khách thương, tiền vào như nước! 🌊💸',
      hashtags: ['#setngulinhthach', '#combo', '#kinhdoanh', '#phongthuy', '#gemral'],
    },
    {
      content: '🐯 Mạnh mẽ, quyết đoán nhưng vẫn đầy tinh tế. Đó là cảm giác khi đeo vòng tay **Thiên Lộc**.\n\nĐược chế tác từ thạch anh vàng cao cấp kết hợp charm Tỳ Hưu, **Thiên Lộc** không chỉ là món trang sức đẳng cấp mà còn là vật phẩm hộ mệnh cho những ai đang ấp ủ những dự định lớn.\n\nTỳ Hưu thì ai cũng biết rồi, chỉ ăn vàng bạc châu báu chứ không nhả ra. Kết hợp với năng lượng thịnh vượng của thạch anh vàng, đây chính là \"trợ thủ đắc lực\" để bạn bứt phá doanh số tháng này đấy! 💪',
      hashtags: ['#thienloc', '#vongtaytyhu', '#thachanhvang', '#manhme', '#quyetdoan'],
    },
    {
      content: '🔮 **Tinh Hà Thạch** - Vẻ đẹp của dải ngân hà trong lòng bàn tay.\n\nNhìn vào cụm thạch anh tím này, bạn sẽ thấy như đang lạc vào một bầu trời đêm đầy sao. **Tinh Hà Thạch** mang năng lượng của sự thông thái và trí tuệ vũ trụ.\n\nĐây là lựa chọn tuyệt vời cho những ai đang làm công việc sáng tạo, nghiên cứu hoặc cần sự tập trung cao độ. Nó giúp khai mở luân xa con mắt thứ ba, mang lại những ý tưởng đột phá. Đừng để sự bế tắc cản trở bạn, hãy để **Tinh Hà Thạch** soi đường! ✨',
      hashtags: ['#tinhhathach', '#thachanhtim', '#sangtao', '#tritue', '#galaxy'],
    },
    {
      content: 'Bạn có tin vào \"tình yêu sét đánh\" với một viên đá không? 😍\n\nLần đầu tiên nhìn thấy **Định Duyên Ngọc**, mình đã không thể rời mắt. Viên thạch anh hồng trụ này có một sức hút kỳ lạ. Nó không rực rỡ chói lóa, mà dịu dàng, ấm áp như vòng tay người thương.\n\n**Định Duyên Ngọc** được tin là giúp kết nối những tâm hồn đồng điệu, thu hút nhân duyên lành. Nếu bạn đang độc thân và chờ đợi một nửa của mình, hoặc muốn hâm nóng tình cảm lứa đôi, hãy thử gửi gắm mong ước vào viên đá này nhé. ❤️',
      hashtags: ['#dinhduyenngoc', '#thachanhhong', '#tinhduyen', '#ketnoi', '#love'],
    },
    {
      content: '🌊 **Thanh Hải Ngọc - Cây Tái Sinh**: Sức sống mãnh liệt từ đại dương.\n\nKết hợp giữa Aquamarine (Ngọc xanh biển) và Thạch anh xanh, **Thanh Hải Ngọc** mang đến luồng gió mới mát lành cho không gian sống của bạn. \n\nAquamarine là viên đá của sự can đảm và bình tĩnh, trong khi Thạch anh xanh đại diện cho sự chữa lành và phát triển. Cây tài lộc này đặc biệt phù hợp với những ai đang muốn \"F5\" lại bản thân, bắt đầu một chặng đường mới hoặc phục hồi sau những biến cố. Hãy để năng lượng của biển cả chữa lành tâm hồn bạn. 🌊',
      hashtags: ['#thanhhaingoc', '#aquamarine', '#taisinh', '#healing', '#newbeginnings'],
    },
    {
      content: '👑 **Hoàng Kim Trụ** - Biểu tượng của quyền lực và vị thế.\n\nKhông phải ngẫu nhiên mà các sếp lớn thường đặt một trụ thạch anh vàng lớn trên bàn làm việc. **Hoàng Kim Trụ** với dáng đứng sừng sững, vững chãi, tỏa ra năng lượng của sự lãnh đạo và uy quyền.\n\nNó giúp chủ nhân giữ vững lập trường, ra quyết định sáng suốt và thu phục nhân tâm. Nếu bạn đang phấn đấu cho một vị trí quản lý hoặc muốn khẳng định vị thế của mình, **Hoàng Kim Trụ** chính là vật phẩm phong thủy không thể thiếu.',
      hashtags: ['#hoangkimtru', '#thachanhvang', '#lanhdao', '#quyenluc', '#boss'],
    },
    {
      content: '🌙 **Dạ Nguyệt** - Vẻ đẹp bí ẩn của ánh trăng.\n\nChiếc vòng tay Thạch anh tím charm Vô cực này có tên là **Dạ Nguyệt**. Nhẹ nhàng, tinh tế nhưng đầy cuốn hút. \n\nThạch anh tím giúp cân bằng cảm xúc, giảm stress, trong khi biểu tượng Vô cực đại diện cho sự trường tồn và khả năng vô hạn. Đeo **Dạ Nguyệt**, bạn như mang theo bên mình một nguồn năng lượng bình an, giúp bạn vượt qua mọi thăng trầm của cuộc sống một cách nhẹ nhàng nhất. 🌕',
      hashtags: ['#danguyet', '#thachanhtim', '#vongtay', '#charmvocuc', '#binhan'],
    },
    {
      content: '🎁 Quà tặng ý nghĩa cho đối tác: **KHAY VÀNG DECOR**.\n\nTìm quà tặng sếp hay đối tác bao giờ cũng đau đầu. Tặng gì vừa sang, vừa ý nghĩa lại không quá phô trương? **KHAY VÀNG DECOR** làm từ thạch anh vàng tự nhiên chính là câu trả lời.\n\nVừa là vật phẩm trang trí đẳng cấp, vừa mang ý nghĩa thu hút tài lộc, vượng khí cho gia chủ. Đảm bảo người nhận sẽ cực kỳ ấn tượng với sự tinh tế của bạn. Món quà nhỏ nhưng giá trị phong thủy to! 🎁✨',
      hashtags: ['#khayvangdecor', '#quatangdoanhnghiep', '#thachanhvang', '#sangtrong', '#tinhte'],
    },
    {
      content: '🧘‍♀️ Thiền định sâu hơn với **Set Thất Tinh Bắc Đẩu**.\n\nĐây là một trận đồ năng lượng cổ xưa, sử dụng 7 viên cầu thạch anh (Hồng, Trắng, Tím, Vàng...) sắp xếp theo hình sao Bắc Đẩu. \n\n**Set Thất Tinh Bắc Đẩu** giúp khuếch đại năng lượng lên gấp nhiều lần, tạo ra một trường khí bảo vệ mạnh mẽ xung quanh người thiền. Nó giúp bạn dễ dàng đi vào trạng thái định, kết nối với bản thể cao hơn và khai mở trí tuệ. Một bảo vật cho các thiền sinh thực thụ! 🧘‍♂️',
      hashtags: ['#setthattinhbacdau', '#thien', '#trando', '#nangluong', '#tamlinh'],
    },
    {
      content: '💎 **Thiên Băng Trụ** - Sự thanh khiết tuyệt đối.\n\nGiữa cuộc sống xô bồ, bụi bặm, ai cũng cần một góc nhỏ trong lành. **Thiên Băng Trụ** (Thạch anh trắng) chính là \"máy lọc không khí\" về mặt năng lượng.\n\nNó giúp trung hòa các bức xạ điện từ từ máy tính, điện thoại, wifi... đồng thời thanh lọc các ý nghĩ tiêu cực, rối rắm. Đặt **Thiên Băng Trụ** trên bàn học hoặc bàn làm việc để giữ cho tâm trí luôn sắc bén và tập trung nhé! ❄️',
      hashtags: ['#thienbangtru', '#thachanhtrang', '#thanhloc', '#taptung', '#mindset'],
    },
    {
      content: '🌹 **Hồng Ngự** - \"Bùa yêu\" cho nàng cá tính.\n\nVòng tay Thạch anh hồng charm Cá Koi - **Hồng Ngự** không chỉ là biểu tượng của tình yêu mà còn là sự kiên trì, bền bỉ lội ngược dòng của loài cá Koi.\n\nĐây là món quà dành cho những cô gái hiện đại: Dịu dàng nhưng không yếu đuối, biết yêu thương nhưng cũng đầy bản lĩnh. Năng lượng của **Hồng Ngự** sẽ giúp bạn thu hút những mối quan hệ chất lượng, những người trân trọng giá trị thật của bạn. 🐟💖',
      hashtags: ['#hongngu', '#cakoi', '#thachanhhong', '#tinhyeu', '#banlinh'],
    },
    {
      content: '🌟 **Set Ẩn Long Thạch Limited Edition** - Đẳng cấp của người sưu tầm.\n\nKhông phải ai cũng có cơ hội sở hữu bộ này. **Set Ẩn Long Thạch** là tập hợp những tinh thể thạch anh độc đáo, hiếm có, mang năng lượng của rồng thiêng ẩn mình.\n\nĐây là vật phẩm dành cho những ai đang ủ mưu lớn, chờ thời cơ để bùng nổ. Năng lượng của nó giúp tích tụ nội lực, rèn luyện sự kiên nhẫn và bứt phá mạnh mẽ khi thời điểm đến. Số lượng cực giới hạn, ai nhanh tay thì còn nhé! 🐉',
      hashtags: ['#setanlongthach', '#limitededition', '#daquy', '#suutam', '#manhme'],
    },
    {
      content: '👀 **Huyền Ảnh** - Bảo vệ bạn khỏi những ánh nhìn đố kỵ.\n\nVòng đá Hematite charm Evil Eye (Mắt quỷ) - **Huyền Ảnh**. Nghe tên thì sợ nhưng công dụng lại cực kỳ bảo vệ. Biểu tượng Evil Eye từ xa xưa đã được dùng để chống lại những lời nguyền rủa, sự ghen ghét hay những ý đồ xấu.\n\nKết hợp với đá Hematite giúp cân bằng năng lượng, **Huyền Ảnh** tạo ra một lá chắn vô hình, giúp bạn tự tin tỏa sáng mà không lo bị \"tiểu nhân\" ngáng đường. 👁️✋',
      hashtags: ['#huyenanh', '#evileye', '#hematite', '#baove', '#tranhthiphi'],
    },
    {
      content: '📚 Tri thức là sức mạnh, nhưng làm sao để áp dụng đúng?\n\nNgoài đá quý, bên mình còn có **Ebook GIẢI MÃ 5 VÒNG LẶP NGHIỆP LỰC**. Đây là cuốn cẩm nang giúp bạn hiểu rõ nguyên nhân gốc rễ của những vấn đề lặp đi lặp lại trong cuộc sống (tài chính, tình cảm...).\n\nKhi kết hợp việc đọc hiểu Ebook này với việc sử dụng đá năng lượng (như **Bộ Bản Đồ Chọn Đá Theo Từng Loại Nghiệp**), bạn sẽ có trong tay công cụ mạnh mẽ để chuyển hóa vận mệnh. Đừng chỉ chữa triệu chứng, hãy chữa từ gốc rễ! 🌱',
      hashtags: ['#ebook', '#nghiepluc', '#chuyenhoa', '#kienthuc', '#gemral'],
    },
    {
      content: '🌟 Khi bạn cảm thấy mất phương hướng, hãy tìm về sự cân bằng với **Set Ngũ Đại Thạch**.\n\nCuộc sống đôi khi như một cơn bão, cuốn chúng ta đi xa khỏi tâm điểm của chính mình. **Set Ngũ Đại Thạch** là sự hội tụ của 5 loại tinh thể đại diện cho 5 yếu tố ngũ hành, giúp tái thiết lập sự cân bằng năng lượng bên trong bạn.\n\nMình thường dùng set này để thiền định vào những ngày cuối tháng. Cảm giác như được \"reset\" lại toàn bộ hệ thống vậy. Mọi chông chênh, lo lắng đều được xoa dịu, nhường chỗ cho sự tĩnh tại và sáng suốt. Một bộ kit không thể thiếu cho những ai đang tu tập! 🧘‍♂️',
      hashtags: ['#setngudaithach', '#nguhanh', '#canbang', '#thien', '#gemral'],
    },
    {
      content: '🔥 Dành cho những chiến binh khởi nghiệp: **Set Giáng Long Thạch**.\n\nKhởi nghiệp chưa bao giờ là con đường trải hoa hồng. Sẽ có lúc bạn nản lòng, muốn buông xuôi. Đó là lúc bạn cần đến năng lượng của Rồng thiêng.\n\n**Set Giáng Long Thạch** với sự kết hợp của Aquamarine và Thạch anh tóc, mang đến sức mạnh của sự bứt phá và kiên định. Nó giúp bạn vượt qua nỗi sợ hãi, giữ vững ý chí sắt đá trước mọi thử thách. Hãy để năng lượng của rồng dẫn lối bạn đến thành công! 🐉💪',
      hashtags: ['#setgianglongthach', '#khoinghiep', '#manhme', '#burtpha', '#gemral_startup'],
    },
    {
      content: '💖 **Hiên Viên - Vòng Thạch Anh Hồng Charm Vô Cực**: Tình yêu không có điểm dừng.\n\nNếu bạn đang tìm kiếm một món quà ý nghĩa cho bản thân hoặc người thương, đừng bỏ qua em vòng **Hiên Viên** này nhé. Màu hồng ngọt ngào của thạch anh kết hợp với biểu tượng vô cực (Infinity) tượng trưng cho một tình yêu trường tồn, không giới hạn.\n\nĐeo nó, mình cảm thấy như được bao bọc bởi một trường năng lượng yêu thương dịu nhẹ. Nó nhắc nhở mình rằng: Dù có chuyện gì xảy ra, tình yêu vẫn luôn hiện hữu xung quanh ta. 🥰',
      hashtags: ['#hienvien', '#thachanhhong', '#charmvocuc', '#tinhyeu', '#quatang'],
    },
    {
      content: '🤫 Một bí mật nhỏ giúp mình ngủ ngon hơn mỗi tối: **Dạ Tinh Thạch**.\n\nCụm thạch anh tím này không chỉ đẹp lộng lẫy như một tác phẩm nghệ thuật, mà còn là \"liều thuốc an thần\" tự nhiên tuyệt vời. Đặt **Dạ Tinh Thạch** ở đầu giường, năng lượng của nó sẽ giúp làm dịu hệ thần kinh, xua tan những giấc mơ rối rắm.\n\nTừ ngày có em ấy, mình thấy giấc ngủ sâu hơn, sáng dậy tinh thần sảng khoái hẳn. Bạn nào hay bị mất ngủ hoặc hay suy nghĩ nhiều về đêm thì tham khảo ngay nhé! 😴💤',
      hashtags: ['#datinhthach', '#thachanhtim', '#ngungon', '#giamstress', '#gemral_tips'],
    },
    {
      content: '✨ **Ngũ Quang Thạch** - Viên đá của hào quang và sự thu hút.\n\nBạn có muốn trở thành tâm điểm của mọi ánh nhìn không? **Ngũ Quang Thạch** (Thạch anh Aura) với lớp tráng kim loại lấp lánh, phản chiếu đủ sắc màu cầu vồng, chính là bí quyết để bạn tỏa sáng.\n\nNăng lượng của nó giúp kích hoạt hào quang (aura) của bạn, làm tăng sự tự tin và quyến rũ. Dù là đi tiệc hay đi gặp khách hàng, chỉ cần mang theo một trụ **Ngũ Quang Thạch**, bạn sẽ thấy mình thần thái hơn hẳn đấy! ✨💃',
      hashtags: ['#nguquangthach', '#auraquartz', '#toasang', '#quyenru', '#gemral_beauty'],
    },
    {
      content: '💰 Muốn tiền vào như nước, hãy trồng **Đế Vượng - Cây Đại Lộc**!\n\nCây tài lộc thì nhiều, nhưng **Đế Vượng** lại ở một đẳng cấp khác. Với tán cây xum xuê được làm từ hàng trăm viên thạch anh vàng tuyển chọn, nó tượng trưng cho sự sinh sôi nảy nở không ngừng của tài sản.\n\nĐặt **Đế Vượng** ở quầy thu ngân hoặc két sắt, bạn đang kích hoạt dòng chảy thịnh vượng mạnh mẽ nhất. Khách hàng đến nườm nượp, đơn hàng chốt liên tục. Không tin cứ thử xem, phong thủy không đùa được đâu! 😉💸',
      hashtags: ['#devuong', '#caydailoc', '#thachanhvang', '#phongthuy', '#kinhdoanh'],
    },
    {
      content: '🛡️ Bảo vệ toàn diện với **Set Lục Thần Phù**.\n\nTrong cuộc sống, không tránh khỏi những lúc chúng ta gặp phải vận xui hay tiểu nhân quấy phá. **Set Lục Thần Phù** là sự kết hợp của 6 loại đá bảo hộ mạnh mẽ nhất, tạo nên một lá chắn năng lượng vững chắc.\n\nMình thường mang theo một viên trong set này khi đi công tác xa hoặc đến những nơi có trường khí không tốt. Cảm giác an tâm vô cùng. Đây thực sự là vật hộ thân cần thiết cho mọi người. 🙏',
      hashtags: ['#setlucthanphu', '#baove', '#truta', '#hothan', '#gemral_protect'],
    },
    {
      content: '🔮 **Set Thiên Nhãn - Vòng đá Sức Mạnh**: Đánh thức trực giác bên trong bạn.\n\nĐôi khi, câu trả lời cho mọi vấn đề không nằm ở bên ngoài, mà nằm ngay trong chính trực giác của chúng ta. **Set Thiên Nhãn** với sự kết hợp của Hematite và Thạch anh trắng giúp khai mở con mắt thứ ba, tăng cường khả năng nhìn thấu sự thật.\n\nKhi đeo bộ vòng này, mình cảm thấy quyết đoán hơn trong mọi lựa chọn. Những linh cảm mách bảo thường rất chính xác. Nếu bạn đang đứng giữa những ngã rẽ, hãy để **Set Thiên Nhãn** soi đường! 👁️✨',
      hashtags: ['#setthiennhan', '#hematite', '#trucgiac', '#sangsot', '#gemral_intuition'],
    },
    {
      content: '🌸 **Như Ý Lệnh - Cây Tình Ái**: Để tình yêu đơm hoa kết trái.\n\nCây thạch anh hồng **Như Ý Lệnh** này xinh xỉu luôn mọi người ơi! Nhìn vào là thấy cả một bầu trời lãng mạn rồi. Đây là vật phẩm phong thủy chuyên dùng để cầu duyên và giữ lửa hạnh phúc gia đình.\n\nĐặt **Như Ý Lệnh** trong phòng ngủ, năng lượng hồng ấm áp sẽ lan tỏa, giúp hàn gắn những rạn nứt và thắp lại ngọn lửa yêu thương. Ai đang ế thì coi chừng \"thoát ế\" bất ngờ nha! 😜❤️',
      hashtags: ['#nhuylen', '#caytinhai', '#thachanhhong', '#tinhduyen', '#hanhphuc'],
    },
    {
      content: '🧘‍♂️ Kết hợp **Sổ Tay THỰC HÀNH LÒNG BIẾT ƠN** và Đá năng lượng.\n\nMỗi sáng, mình dành 10 phút để viết vào cuốn sổ tay này những điều mình biết ơn, tay kia nắm chặt một viên thạch anh trắng. Sự kết hợp này tạo ra một trường năng lượng rung động cực cao.\n\nKhi lòng biết ơn được khuếch đại bởi năng lượng của đá, mình cảm thấy cuộc sống nhẹ nhàng và đủ đầy hơn rất nhiều. Luật hấp dẫn hoạt động mạnh mẽ nhất khi ta ở trạng thái biết ơn. Hãy thử thực hành ritual nhỏ này mỗi ngày nhé! 🙏✨',
      hashtags: ['#longbieton', '#sotay', '#gratitude', '#thachanhtrang', '#gemral_morning'],
    },
    {
      content: '🐉 **Huyền Vũ Thạch** - Trụ đá của sự Huyền bí và Quyền năng.\n\nTrụ thạch anh tím đậm màu này mang tên **Huyền Vũ Thạch**, tượng trưng cho một trong tứ tượng linh thú. Nó mang năng lượng của sự bảo vệ phương Bắc và trí tuệ sâu sắc.\n\nĐặt **Huyền Vũ Thạch** trên bàn làm việc giúp bạn giữ cái đầu lạnh, tư duy chiến lược và tránh xa những cám dỗ thị phi. Một vật phẩm không thể thiếu cho những nhà lãnh đạo hay người làm quản lý. 🕴️',
      hashtags: ['#huyenvuthach', '#thachanhtim', '#lanhdao', '#chienluoc', '#gemral_power'],
    },
    {
      content: '💍 **Vũ Âm - Vòng Hematite Charm Thần Chú OM**: Sự tĩnh lặng giữa ồn ào.\n\nTrong thế giới vội vã này, tìm được một khoảng lặng thật khó. Chiếc vòng **Vũ Âm** với chất liệu Hematite đen bóng và charm OM như một nốt trầm xao xuyến.\n\nHematite giúp cân bằng huyết áp, giảm stress, còn thần chú OM mang lại sự bình an trong tâm hồn. Mỗi khi cảm thấy quá tải, mình lại xoay nhẹ hạt charm và hít thở sâu. Cảm giác như được trở về ngôi nhà bình yên của chính mình vậy. 🧘‍♀️',
      hashtags: ['#vuam', '#hematite', '#om', '#binhan', '#stressrelief'],
    },
    {
      content: '✨ **Set Tam Sinh Thạch** - Kết nối Quá khứ, Hiện tại và Tương lai.\n\nBộ 3 viên đá này tượng trưng cho ba kiếp nhân sinh (Tam Sinh). Nó giúp bạn chữa lành tổn thương quá khứ, sống trọn vẹn ở hiện tại và kiến tạo tương lai rực rỡ.\n\nMình thường dùng **Set Tam Sinh Thạch** trong các buổi thiền hồi quy hoặc khi cần định hướng lại mục tiêu cuộc đời. Năng lượng của nó rất sâu và thấm. Một bộ đá dành cho những tâm hồn già cỗi đang tìm kiếm ý nghĩa cuộc sống. 🌌',
      hashtags: ['#settamsinhthach', '#tamsinh', '#pastpresentfuture', '#tamlinh', '#gemral_soul'],
    },
    {
      content: '🌟 **Thiên Vượng - Vòng Thạch Anh Vàng Charm Tỳ Hưu**: Kích hoạt cung tài lộc.\n\nNếu bạn đang cảm thấy dòng tiền bị tắc nghẽn, hãy thử đeo vòng **Thiên Vượng**. Khác với Thiên Lộc thiên về sự mạnh mẽ, **Thiên Vượng** mang năng lượng của sự sung túc, tròn đầy.\n\nThạch anh vàng giúp thu hút cơ hội, còn Tỳ Hưu giữ tiền của. Đeo em này đi ký hợp đồng hay chốt sale thì tự tin hơn hẳn. Nhớ là Tỳ Hưu phải hướng miệng ra ngoài để hút tài lộc về nhé! 💰🍀',
      hashtags: ['#thienvuong', '#tyhu', '#thachanhvang', '#hutien', '#gemral_wealth'],
    },
    {
      content: '📘 **Sổ Tay CHUYỂN HÓA TÂM LINH - 21 NGÀY SỐNG ĐÚNG PHÁP**\n\nTu tập không phải là chuyện ngày một ngày hai. Cuốn sổ tay này là người bạn đồng hành tuyệt vời giúp bạn xây dựng thói quen tu tập mỗi ngày.\n\nKết hợp việc đọc và thực hành theo sổ tay với việc sử dụng các loại đá phù hợp (như trong bộ **Bản đồ chọn đá theo từng loại nghiệp**), bạn sẽ thấy sự chuyển hóa rõ rệt trong tâm thức. Hãy kiên trì 21 ngày, phép màu sẽ xuất hiện! ✨📖',
      hashtags: ['#chuyenhoatamlinh', '#21ngay', '#tu_tap', '#ebook', '#gemral_journey'],
    },
    {
      content: '💎 **Dạ Thiên Thạch** - Trụ đá kết nối tâm linh.\n\nTrụ thạch anh tím **Dạ Thiên Thạch** vươn thẳng lên trời như một ăng-ten thu phát sóng vũ trụ. Đây là công cụ hỗ trợ đắc lực cho những ai đang thực hành Tarot, Reiki hay các bộ môn huyền học.\n\nNăng lượng của nó giúp thanh tẩy bộ bài, tăng cường trực giác và kết nối với các Đấng bảo hộ. Đặt trên bàn thờ hoặc góc làm việc tâm linh đều rất tuyệt. 🔮✨',
      hashtags: ['#dathienthach', '#thachanhtim', '#tarot', '#reiki', '#gemral_spiritual'],
    },
    {
      content: '🌈 **Duyên Khởi Lộ - Tinh Dầu Nước Hoa JÉRIE**: Mùi hương của sự quyến rũ.\n\nKhông chỉ là đá, mùi hương cũng mang tần số năng lượng. **Duyên Khởi Lộ** là sự kết hợp tinh tế của các nốt hương giúp kích hoạt luân xa tim và luân xa xương cùng.\n\nXức một chút tinh dầu lên cổ tay và sau gáy, kết hợp đeo vòng **Hồng Ngự**, bạn sẽ tạo ra một trường năng lượng thu hút khó cưỡng. Người ta hay bảo \"hữu xạ tự nhiên hương\" là đây chứ đâu! 🌸💋',
      hashtags: ['#duyenkhoilo', '#tinhdaujerie', '#muihuong', '#quyenru', '#gemral_scent'],
    },
    {
      content: '🧊 **Set Băng Vũ Thạch** - Hạ nhiệt những cái đầu nóng.\n\nKhi bạn cảm thấy nóng giận, bực bội, hãy tìm đến sự mát lạnh của **Set Băng Vũ Thạch**. Bộ đá này gồm Thạch anh trắng và Khói xám, mang năng lượng của băng và gió.\n\nCầm đá trong tay, nhắm mắt lại và hình dung một làn gió mát thổi qua tâm trí, cuốn trôi mọi cơn giận dữ. Bình tĩnh lại rồi hẵng quyết định nhé. Nóng giận là bản năng, tĩnh lặng là bản lĩnh! ❄️🧘‍♂️',
      hashtags: ['#setbangvuthach', '#kiemsoatcamxuc', '#binhtinh', '#healing', '#gemral_calm'],
    },
    {
      content: '✨ **Set Mật Thiên Lệnh** - Chìa khóa mở cửa kho báu vũ trụ.\n\nĐây là một set đá đặc biệt dành cho những ai đang thực hành Luật Hấp Dẫn chuyên sâu. **Set Mật Thiên Lệnh** bao gồm các tinh thể có khả năng lưu trữ và khuếch đại ý niệm cực mạnh.\n\nViết mục tiêu của bạn ra giấy, đặt dưới bộ đá này và thiền định mỗi ngày. Bạn đang gửi một \"mật lệnh\" đến vũ trụ đấy. Hãy tin tưởng và đón nhận! 🌌🗝️',
      hashtags: ['#setmatthienlenh', '#manifestation', '#luathapdan', '#khobau', '#gemral_magic'],
    },
    {
      content: '🌿 **Set Cửu Tinh Thạch** - Cân bằng cuộc sống hoàn hảo.\n\nSố 9 (Cửu) tượng trưng cho sự vĩnh cửu và trọn vẹn. **Set Cửu Tinh Thạch** tập hợp 9 loại đá quý khác nhau, đại diện cho 9 khía cạnh của cuộc sống: Sức khỏe, Tình yêu, Sự nghiệp, Gia đạo, Danh tiếng...\n\nSở hữu bộ đá này giống như bạn có một \"đội ngũ cố vấn\" năng lượng toàn diện. Đặt trong phòng khách để cả gia đình cùng hưởng năng lượng an lành và may mắn nhé! 🏠👨‍👩‍👧‍👦',
      hashtags: ['#setcuutinhthach', '#phongthuygiadinh', '#toandien', '#mayman', '#gemral_family'],
    },
    {
      content: '🌬️ Làm sạch không gian tâm linh với **Xô Thơm Trắng Combo**\n\nTrước khi đón một viên đá mới về nhà, hay khi cảm thấy không khí trong phòng trở nên nặng nề, bí bách, việc đầu tiên mình làm là đốt một bó xô thơm (White Sage).\n\nKhói xô thơm có khả năng thanh tẩy cực mạnh, nó len lỏi vào từng ngóc ngách, xua tan những năng lượng tù đọng và trược khí. Đây là bước chuẩn bị quan trọng để tạo ra một \"khoảng không sạch\" (sacred space) trước khi bạn thực hiện bất kỳ nghi thức nào với đá.\n\nHương thơm thảo mộc nồng ấm cũng giúp tâm trí thư giãn tức thì. Cuối tuần này, hãy thử làm mới ngôi nhà của bạn với ritual thanh tẩy này nhé! 🌿🔥',
      hashtags: ['#xothom', ', ', ', ', ', '],
    },
    {
      content: '🔮 **Set Thiên Ý - Thông Điệp Từ Thượng Đế**: Khi bạn cần một câu trả lời.\n\nCó những lúc đứng giữa ngã ba đường, lý trí không thể phân định đúng sai. Đó là lúc bạn cần kết nối với nguồn dẫn dắt cao hơn. **Set Thiên Ý** gồm những cụm thạch anh trắng tinh khiết nhất, hoạt động như một kênh thu phát sóng tâm linh.\n\nĐặt tay lên những tinh thể này, hít thở sâu và thầm đặt câu hỏi. Năng lượng của **Thiên Ý** sẽ giúp xóa tan màn sương mù trong tâm trí, để câu trả lời hiện ra rõ ràng như một tia sáng. Hãy tin tưởng vào trực giác của mình! ✨',
      hashtags: ['#setthieny', '#thachanhtrang', '#guidance', '#trucgiac', '#gemral_spirit'],
    },
    {
      content: '✨ **Huyền Kim Trụ** - Sự vững chãi của Đất và Vàng.\n\nKhác với sự rực rỡ của thạch anh vàng thông thường, **Huyền Kim Trụ** mang sắc màu trầm mặc pha trộn giữa khói xám và vàng kim. Đây là viên đá của sự ổn định tài chính và quyền lực ngầm.\n\nNó giúp chủ nhân: \n1. Giữ tiền tốt hơn (tránh thất thoát).\n2. Trấn áp những năng lượng tiêu cực nhắm vào công việc kinh doanh.\n3. Ra quyết định điềm tĩnh, chắc chắn.\n\nNếu bạn là người lãnh đạo cần sự uy nghiêm và vững vàng, **Huyền Kim Trụ** chính là \"trợ thủ\" đắc lực trên bàn làm việc. 🏛️',
      hashtags: ['#huyenkimtru', '#thachanhvang', '#khoixam', '#vungchai', '#lanhdao'],
    },
    {
      content: '💞 **Song Định Duyên Ngọc** - Cặp đôi hoàn hảo.\n\nĐã bao giờ bạn và người ấy cùng sở hữu một cặp đá đôi chưa? **Song Định Duyên Ngọc** là hai viên thạch anh hồng được chế tác từ cùng một khối đá nguyên bản, mang ý nghĩa \"tuy hai mà một\".\n\nViệc mỗi người giữ một viên giúp tạo ra sợi dây liên kết năng lượng vô hình. Dù ở xa nhau, tần số của hai viên đá vẫn cộng hưởng, giúp hai bạn luôn cảm thấy gần gũi, thấu hiểu và bao dung cho nhau hơn. Một món quà kỷ niệm cực kỳ ý nghĩa! 👩‍❤️‍👨',
      hashtags: ['#songdinhduyenngoc', '#thachanhhong', '#couplegoals', '#yeuxa', '#gemral_love'],
    },
    {
      content: '🌸 **Set Phượng Nghi Thạch** - Đánh thức nữ tính thiêng liêng.\n\nPhụ nữ hiện đại thường phải gồng mình mạnh mẽ, đôi khi quên mất sức mạnh thực sự nằm ở sự mềm mại. **Set Phượng Nghi Thạch** (kết hợp Thạch anh hồng và Trắng) được thiết kế để chữa lành và tôn vinh năng lượng nữ tính (Divine Feminine).\n\nSử dụng set này trong các buổi thiền hoặc tắm bồn giúp bạn kết nối lại với cơ thể, yêu thương bản thân và tỏa sáng khí chất dịu dàng nhưng đầy nội lực. Hãy là một phượng hoàng tái sinh từ tro tàn, rực rỡ và kiêu hãnh! 🦚✨',
      hashtags: ['#setphuongnghithach', '#divinefeminine', '#nutinh', '#selfcare', '#gemral_women'],
    },
    {
      content: '👃 **Sky \"Thiên Ngữ\" - Tinh Dầu Nước Hoa JÉRIE**: Mùi hương của sự thức tỉnh.\n\nBạn có biết khứu giác là con đường ngắn nhất để tác động đến não bộ và cảm xúc? **Sky \"Thiên Ngữ\"** không chỉ là nước hoa, mà là một công cụ nâng tần số rung động.\n\nVới các nốt hương thanh khiết, bay bổng, nó giúp mở rộng Luân xa Cổ họng và Vương miện. Xức một chút trước khi thiền hoặc khi cần sáng tạo, bạn sẽ thấy tâm hồn mình như đang \"trò chuyện\" với bầu trời. Kết hợp cùng đá năng lượng để đạt hiệu quả tối đa nhé! ☁️',
      hashtags: ['#skythienngu', '#jerie', '#tinhdau', '#tanso', '#gemral_scent'],
    },
    {
      content: '🌟 **Set Tam Bảo Thạch** - Kiềng ba chân cho cuộc sống viên mãn.\n\nSức khỏe - Tài lộc - Bình an. Đó là 3 trụ cột mà ai cũng hướng tới. **Set Tam Bảo Thạch** hội tụ đủ 3 loại đá đại diện cho 3 khía cạnh này (Thạch anh Vàng, Tím, Huyền Kim...).\n\nSở hữu bộ này giống như bạn đang xây dựng một nền móng vững chắc cho ngôi nhà vận mệnh của mình. Không cần cầu kỳ, chỉ cần đặt chúng ở vị trí trung tâm ngôi nhà (phòng khách), năng lượng sẽ tự động lan tỏa và cân bằng mọi phương diện. 🏠✨',
      hashtags: ['#settambaothach', '#tamtrut', '#vienman', '#phongthuy', '#gemral_life'],
    },
    {
      content: '📿 **Linh Phù - Vòng Hematite Charm Thần Chú OM**: Vật hộ thân nhỏ gọn.\n\nKhông phải lúc nào cũng tiện mang theo trụ đá to đùng. Những lúc đi đường, đi du lịch, chiếc vòng **Linh Phù** nhỏ nhắn này là lựa chọn số 1 của mình.\n\nĐá Hematite đen bóng giúp tiếp đất, giữ vững tinh thần, còn charm OM bảo vệ tâm thức khỏi những xao động. Nó giống như một tấm bùa bình an hiện đại, vừa thời trang, vừa linh nghiệm. Đi đâu cũng nhớ mang theo em nó nhé! 🚗✈️',
      hashtags: ['#linhphu', '#hematite', '#om', '#travelsafe', '#gemral_accessories'],
    },
    {
      content: '💰 **Vàng Găm (Pyrite)** - Nam châm hút tiền cực mạnh.\n\nNhìn bề ngoài, Pyrite lấp lánh ánh kim giống như vàng thật, nên còn được gọi là \"Vàng của kẻ khờ\". Nhưng trong năng lượng học, nó không hề khờ chút nào! \n\n**Vàng Găm** mang năng lượng Dương (Masculine) cực mạnh, tượng trưng cho sự giàu có, sung túc và hành động quyết liệt. Đặt một khối Vàng Găm lên trên tập hồ sơ kinh doanh hoặc danh thiếp, bạn đang kích hoạt năng lượng thu hút tài chính mạnh mẽ. Tiền thích năng lượng cao, nhớ nhé! 🤑',
      hashtags: ['#vanggam', '#pyrite', '#hutien', '#nangluongduong', '#gemral_wealth'],
    },
    {
      content: '🌿 **Set Mộng Hồi Thanh** - Chữa lành đứa trẻ bên trong.\n\nQuá khứ đã qua, nhưng những vết thương lòng đôi khi vẫn âm ỉ. **Set Mộng Hồi Thanh** với sự kết hợp của các tinh thể thạch anh đa sắc là liệu pháp màu sắc để xoa dịu những ký ức buồn.\n\nHãy dành thời gian ngồi yên lặng bên set đá này, cho phép những cảm xúc dồn nén được trồi lên và tan biến vào năng lượng của đá. Bạn xứng đáng được bình yên và hạnh phúc ở hiện tại. Hãy để quá khứ ngủ yên. 🍃',
      hashtags: ['#setmonghoithanh', '#innerchild', '#chualanh', '#quakhu', '#gemral_healing'],
    },
    {
      content: '🧘‍♂️ **Thiên Bảo Hương - Trầm Hương Cao Cấp**: Dẫn lối vào thiền định.\n\nCó đá quý rồi, nhưng thiếu mùi hương thì trải nghiệm chưa trọn vẹn. **Thiên Bảo Hương** là dòng trầm hương tự nhiên, khi đốt lên tỏa ra mùi gỗ ấm áp, ngọt sâu.\n\nHương trầm giúp định tâm, an thần và kết nối đất trời. Trước khi ngồi thiền với đá, hãy thắp một nén Thiên Bảo Hương. Bạn sẽ thấy không gian xung quanh chùng xuống, tĩnh lặng và linh thiêng hơn bao giờ hết. Một sự kết hợp hoàn hảo cho nghi thức mỗi ngày. 🙏',
      hashtags: ['#thienbaohuong', '#tramhuong', '#thien', '#tinhTam', '#gemral_ritual'],
    },
    {
      content: '✨ **Kim Ngân Trụ** - Trụ cột tài chính vững bền.\n\nNếu Kim Linh Thạch là những đốm lửa nhỏ, thì **Kim Ngân Trụ** (Trụ thạch anh vàng) là ngọn đuốc lớn soi sáng con đường tài vận. Hình dáng trụ thẳng đứng tượng trưng cho sự thăng tiến và phát triển không ngừng.\n\nĐặt **Kim Ngân Trụ** ở hướng Đông Nam (cung Tài Lộc) hoặc trên két sắt để gia cố sự vững chắc cho nguồn tiền của bạn. Đầu tư cho đá là đầu tư cho dòng chảy năng lượng thịnh vượng của chính mình. 💎💵',
      hashtags: ['#kimngantru', '#thachanhvang', '#tailoc', '#thangtien', '#gemral_invest'],
    },
    {
      content: '🌌 **Set Duyên Định Kim Sinh** - Khi hào quang gặp gỡ.\n\nBộ set này đặc biệt ở chỗ sử dụng Thạch anh Aura (Ngũ Quang Thạch) - loại đá được phủ kim loại quý để tăng cường rung động. **Set Duyên Định Kim Sinh** giúp bạn nâng cao tần số rung động của bản thân lên mức \"lấp lánh\".\n\nKhi hào quang của bạn sáng, bạn tự nhiên sẽ thu hút những mối nhân duyên tốt đẹp, những cơ hội bất ngờ. Luật hấp dẫn đơn giản lắm: Bạn tỏa sáng, bạn sẽ gặp ánh sáng! ✨🤝',
      hashtags: ['#setduyendinhkimsinh', '#auraquartz', '#nhanduyen', '#luathapdan', '#gemral'],
    },
    {
      content: '📜 **7 RITUAL - NGHI LỄ CHIÊU CẢM ĐIỀU TỐT ĐẸP** (Ebook)\n\nCó đá trong tay mà không biết dùng thì phí lắm! Ebook này là tập hợp 7 nghi thức thực hành đơn giản nhưng hiệu quả mà mình đã đúc kết được.\n\nTừ nghi thức tắm trăng, thanh tẩy, đến nghi thức thu hút tiền bạc hay tình yêu... tất cả đều được hướng dẫn chi tiết từng bước. Hãy biến việc chơi đá thành một lối sống (lifestyle), một nghệ thuật sống tỉnh thức. Tải ngay để bắt đầu hành trình phép màu của bạn nhé! 📖✨',
      hashtags: ['#7ritual', '#ebook', '#nghile', '#lifestyle', '#gemral_guide'],
    },
    {
      content: '🌑 **Set Dạ Kim Tụ** - Tích tụ năng lượng trong màn đêm.\n\nBan ngày chúng ta tiêu hao năng lượng ra bên ngoài, ban đêm là lúc cần thu về và tái tạo. **Set Dạ Kim Tụ** gồm các tinh thể có khả năng hấp thụ và lưu trữ năng lượng cực tốt.\n\nĐặt set này trong phòng ngủ hoặc không gian thiền tối, nó sẽ âm thầm gom nhặt vượng khí, thanh lọc trược khí trong khi bạn ngủ. Sáng dậy, bạn sẽ thấy không gian tươi mới và bản thân tràn đầy sinh lực. Hãy để đá làm việc ngay cả khi bạn nghỉ ngơi! 🌙',
      hashtags: ['#setdakimtu', '#nangluongdem', '#taitao', '#suckhoe', '#gemral'],
    },
    {
      content: '✨ **Set Lưu Ly Thạch** - Vẻ đẹp của sự thuần khiết.\n\nĐôi khi, sự sang trọng đến từ những điều giản đơn nhất. **Set Lưu Ly Thạch** tập hợp những viên đá với độ trong suốt cao, phản chiếu ánh sáng lung linh.\n\nKhông chỉ đẹp để decor, bộ set này còn mang năng lượng của sự thông suốt, minh mẫn. Khi nhìn vào sự trong trẻo của đá, tâm trí bạn cũng được gột rửa khỏi những toan tính đời thường. Một góc nhỏ \"chill\" và thanh tịnh cho tâm hồn. 💎',
      hashtags: ['#setluulythach', '#trongsuot', '#thanhkhiet', '#decor', '#gemral_beauty'],
    },
    {
      content: '🤝 **Set Tam Hợp Trụ** - Hòa hợp Thân - Tâm - Trí.\n\nCon người hạnh phúc nhất khi 3 yếu tố Thân - Tâm - Trí được đồng nhất. **Set Tam Hợp Trụ** gồm 3 trụ đá (Thường là Khói, Hồng, Tím) đại diện cho sự vững chãi của thân, tình yêu của tâm và trí tuệ của trí.\n\nĐây là bộ đá cân bằng hoàn hảo cho mọi người. Dù bạn đang gặp vấn đề ở khía cạnh nào, sự cộng hưởng của 3 trụ đá này cũng sẽ giúp bạn tìm lại điểm cân bằng. Sống trọn vẹn là sống cân bằng! ⚖️',
      hashtags: ['#settamhop', '#thantamtri', '#canbang', '#holistic', '#gemral'],
    },
    {
      content: '🏆 Đỉnh cao của năng lượng: **Set Thập Bảo Thạch**.\n\nNếu bạn muốn sở hữu một \"bộ sưu tập\" năng lượng toàn diện cho cả ngôi nhà, thì **Set Thập Bảo Thạch** chính là lựa chọn cuối cùng. 10 loại đá quý, 10 nguồn năng lượng, trấn giữ 10 phương vị.\n\nĐây không chỉ là vật phẩm phong thủy, mà là một tác phẩm nghệ thuật sắp đặt. Nó biến ngôi nhà của bạn thành một \"động tiên\" tràn ngập vượng khí. Đầu tư một lần, thịnh vượng dài lâu. Dành cho những gia chủ thực sự am hiểu và chịu chơi! 🏰✨',
      hashtags: ['#setthapbaothach', '#masterpiece', '#phongthuycaocap', '#vuongkhi', '#gemral_vip'],
    },
    {
      content: '🌿 **Set Thanh Tâm Thạch** - Gột rửa phiền não.\n\nCuộc sống áp lực khiến tâm trí chúng ta như một cốc nước bị khuấy đục. **Set Thanh Tâm Thạch** với chủ đạo là Thạch anh vàng và trắng giúp lắng đọng những cặn bã cảm xúc.\n\nHãy dành 15 phút mỗi ngày ngồi đối diện với set đá này, thực hành buông thư. Năng lượng thanh nhẹ của đá sẽ giúp bạn tìm lại sự tĩnh lặng, sáng suốt để giải quyết mọi vấn đề. Tâm thanh tịnh, đời an nhiên. 🍃',
      hashtags: ['#setthanhtamthach', '#giamstress', '#anlac', '#tinhthuc', '#gemral'],
    },
    {
      content: '🙏 **Tượng Phật** & Đá Quý - Sự kết hợp thiêng liêng.\n\nBên cạnh đá năng lượng, việc thỉnh một bức **Tượng Phật** (đá hoặc gốm) đặt tại góc tâm linh sẽ gia tăng sự trang nghiêm và an lạc.\n\nĐá quý là tinh hoa của Đất, Tượng Phật là biểu tượng của Giác Ngộ. Sự kết hợp này tạo ra một trường năng lượng bảo hộ vô lượng. Mỗi khi nhìn thấy Tượng Phật bên cạnh những viên đá lấp lánh, lòng mình lại tự nhắc nhở về sự từ bi và trí tuệ. Một nét đẹp văn hóa tâm linh trong ngôi nhà hiện đại. 🙏💎',
      hashtags: ['#tuongphat', '#bantho', '#tamlinh', '#binhan', '#gemral_worship'],
    },
    {
      content: '👑 **Set Vương Chi Thạch V.I.P 3** - Đỉnh cao của Năng lượng Đế vương.\n\nCó những vị trí không dành cho số đông, và có những bộ đá chỉ dành cho người dẫn đầu. **Set Vương Chi Thạch V.I.P 3** là sự hội tụ của những tinh thể Huyền Kim Trụ và Khói Xám kích thước lớn, mang năng lượng trấn trạch và quyền lực tuyệt đối.\n\nKhi đặt bộ này trong phòng làm việc, bạn không chỉ đang trang trí, mà đang thiết lập một \"vùng cấm\" năng lượng: Chỉ có sự thịnh vượng và tôn trọng được phép bước vào. Đây là bảo vật dành cho những CEO, chủ doanh nghiệp muốn khẳng định vị thế độc tôn của mình. 🏛️🦁',
      hashtags: ['#setvuongchithach', '#vip3', '#huyenkimtru', '#lanhdao', '#gemral_vip'],
    },
    {
      content: '📖 **Sổ Tay TINH THỂ TẦN SỐ CAO** - Cẩm nang gối đầu giường.\n\nBạn sở hữu nhiều đá nhưng chưa thực sự hiểu \"ngôn ngữ\" của chúng? Cuốn sổ tay này sẽ là người phiên dịch cho bạn. Nó không chỉ liệt kê công dụng, mà còn hướng dẫn cách kết nối sâu sắc với từng loại tinh thể ở tần số rung động cao nhất.\n\nHiểu về đá cũng là hiểu về chính mình. Khi bạn biết cách dùng đá để điều chỉnh tần số, bạn nắm trong tay chìa khóa để làm chủ cảm xúc và vận mệnh. Đừng chơi đá theo phong trào, hãy chơi bằng kiến thức! 🧠💎',
      hashtags: ['#sotaytinhthe', '#tansocao', '#kienthuc', '#gemral_edu', '#mastery'],
    },
    {
      content: '🔮 **Quả Cầu Thạch Anh Trắng** - Tầm nhìn xuyên thấu.\n\nTrong giới đầu tư, cái đắt giá nhất không phải là vốn, mà là TẦM NHÌN. Quả cầu thạch anh trắng với hình dáng tròn đầy, tượng trưng cho sự luân chuyển không ngừng và khả năng nhìn thấu mọi sương mù ảo ảnh.\n\nĐặt một quả cầu trắng trên bàn làm việc giúp khai mở luân xa đỉnh đầu, tăng cường sự tập trung và minh mẫn. Khi thị trường biến động, hãy nhìn vào sự tĩnh lặng của quả cầu để tìm lại điểm cân bằng và ra quyết định sáng suốt nhất. ⚪✨',
      hashtags: ['#quacauthachanhtrang', '#tamnhin', '#minhman', '#trader', '#gemral_vision'],
    },
    {
      content: '🌌 **Set Hỗn Nguyên Thạch** - Quay về nguồn cội sức mạnh.\n\n\"Hỗn Nguyên\" nghĩa là khí chất ban sơ của vũ trụ. Bộ set này bao gồm sự phối hợp của Khói Xám, Hồng, Trắng, Tím... tạo nên một vòng tròn năng lượng hoàn chỉnh, mô phỏng sự vận hành của tự nhiên.\n\n**Set Hỗn Nguyên Thạch** giúp bạn tái tạo năng lượng từ gốc rễ, bồi đắp nội lực thâm hậu. Nó đặc biệt phù hợp cho những giai đoạn bạn cần \"ở ẩn\" để tu luyện, học hỏi hoặc chuẩn bị cho một bước nhảy vọt mới. Lùi một bước để tiến ngàn dặm! 🌪️',
      hashtags: ['#sethonnguyenthach', '#noiluc', '#taitao', '#energy', '#gemral_power'],
    },
    {
      content: '🌸 **Quả Cầu Thạch Anh Hồng** - Trái tim của ngôi nhà.\n\nNếu thạch anh trắng là trí tuệ, thì thạch anh hồng là linh hồn. Một **Quả Cầu Thạch Anh Hồng** lớn đặt tại phòng khách sẽ đóng vai trò như một \"trái tim năng lượng\", bơm dòng chảy yêu thương đến mọi thành viên trong gia đình.\n\nNó giúp hóa giải những xung đột, làm mềm đi những lời nói sắc nhọn và gắn kết mọi người lại với nhau. Nhà không chỉ là nơi để ở, mà là nơi để yêu thương và được chữa lành. 🏠❤️',
      hashtags: ['#quacauthachanhhong', '#giadinh', '#hanhphuc', '#ketnoi', '#gemral_home'],
    },
    {
      content: '🔥 **Set Ngũ Linh Thạch V.I.P 1** - Ngũ hành hội tụ.\n\nBạn không biết mình khuyết mệnh gì? Bạn muốn một giải pháp toàn diện? **Set Ngũ Linh Thạch V.I.P 1** chính là câu trả lời. Bộ đá này tập hợp đủ 5 màu sắc đại diện cho Kim - Mộc - Thủy - Hỏa - Thổ, giúp cân bằng bát tự và bổ sung năng lượng thiếu hụt.\n\nKhi ngũ hành tương sinh, vạn sự ắt hanh thông. Đây là bộ đá nền tảng mà bất kỳ ai cũng nên sở hữu để xây dựng một trường năng lượng cá nhân vững chắc và hài hòa. ☯️',
      hashtags: ['#setngulinhthach', '#vip1', '#nguhanh', '#canbang', '#gemral_balance'],
    },
    {
      content: '🧧 **Sổ Tay MANIFEST PHÚC KHÍ 2024** - Thiết kế vận may của bạn.\n\nMay mắn không phải ngẫu nhiên, may mắn là sự chuẩn bị gặp gỡ cơ hội. Cuốn sổ tay này là bản đồ giúp bạn lên kế hoạch thu hút phúc khí cho cả năm.\n\nKết hợp với việc sử dụng đá phong thủy, bạn sẽ học được cách gieo trồng những hạt giống thiện lành trong tâm thức, để từ đó gặt hái quả ngọt trong đời sống thực. Đừng để năm tháng trôi qua vô định, hãy nắm quyền kiểm soát vận mệnh của mình ngay hôm nay! ✍️🍀',
      hashtags: ['#manifestphuckhi', '#sotay', '#kehoach', '#vanmay', '#gemral_2024'],
    },
    {
      content: '💎 **Thạch Anh Vàng (M)** - Viên gạch vàng cho người mới bắt đầu.\n\nBạn muốn trải nghiệm năng lượng thịnh vượng nhưng chưa muốn đầu tư vào những trụ đá lớn? **Thạch Anh Vàng (M)** là lựa chọn hoàn hảo. Nhỏ gọn nhưng đầy uy lực.\n\nBạn có thể cầm nó khi thiền, đặt vào ví tiền để \"lấy vía\", hoặc để trên bàn làm việc. Hãy coi đây là viên gạch nền móng đầu tiên cho tòa tháp tài chính của bạn. Năng lượng tích tiểu thành đại, đừng coi thường những khởi đầu khiêm tốn nhé! 🧱💰',
      hashtags: ['#thachanhvangM', '#khoinguon', '#thinhvuong', '#gemral_starter'],
    },
    {
      content: '🏛️ **Set Tứ Trụ** - Vững như bàn thạch.\n\nTrong kinh doanh và đầu tư, điều quan trọng nhất không phải là đi nhanh, mà là đi BỀN. **Set Tứ Trụ** gồm 4 trụ đá trấn giữ 4 góc, tạo thế vững chãi như kiềng ba chân (à nhầm, bốn chân chứ 😂).\n\nBộ này giúp ổn định trường khí, tránh những biến động thất thường và bảo vệ thành quả bạn đã gây dựng. Nếu bạn cảm thấy công việc đang bấp bênh, hãy dùng **Set Tứ Trụ** để gia cố lại nền móng năng lượng ngay lập tức. 🏗️',
      hashtags: ['#settutru', '#onđinh', '#benvung', '#trantrach', '#gemral_stable'],
    },
    {
      content: '✨ **Set Tam Thiên Thạch** - Thiên thời, Địa lợi, Nhân hòa.\n\nThành công lớn luôn cần sự hội tụ của 3 yếu tố. **Set Tam Thiên Thạch** mang ý nghĩa kết nối năng lượng Trời (Thiên) - Đất (Địa) và Người (Nhân).\n\nSở hữu bộ đá này giúp bạn nhạy bén hơn với thời cuộc (Thiên thời), vững vàng trong môi trường (Địa lợi) và thu phục lòng người (Nhân hòa). Khi mọi thứ đồng điệu, không mục tiêu nào là không thể chinh phục! 🌍🤝',
      hashtags: ['#settamthienthach', '#tamtai', '#thanhcong', '#hoahop', '#gemral_success'],
    },
    {
      content: '💎 **Set Chí Tôn Thạch V.I.P 2** - Khẳng định đẳng cấp thượng lưu.\n\nNếu VIP 3 là quyền lực của người đứng đầu, thì **Set Chí Tôn Thạch V.I.P 2** là sự sang trọng và tinh tế của giới thượng lưu. Với sự kết hợp của Huyền Kim Trụ và các tinh thể đá quý hiếm, bộ set này toát lên vẻ đẹp của sự thành đạt viên mãn.\n\nĐây không chỉ là vật phẩm phong thủy, mà là một tuyên ngôn về phong cách sống. Năng lượng của nó thu hút những mối quan hệ chất lượng cao và những cơ hội làm ăn lớn. Đẳng cấp là mãi mãi! 🥂✨',
      hashtags: ['#setchitonthach', '#vip2', '#thuongluu', '#dangcap', '#gemral_elite'],
    },
    {
      content: '🌿 **Set Lục Bảo Thạch** - Sức sống và Hy vọng.\n\nSố 6 (Lục) trong phong thủy tượng trưng cho Lộc. **Set Lục Bảo Thạch** tập trung vào năng lượng của sự sinh sôi, phát triển và tài lộc dồi dào.\n\nĐặt bộ này ở góc Đông hoặc Đông Nam của ngôi nhà để kích hoạt cung Gia Đạo và Tài Lộc. Năng lượng tươi mới của nó sẽ thổi bừng sức sống cho không gian, giúp mọi việc hanh thông, thuận lợi. Cây cối đâm chồi nảy lộc, tiền tài cũng theo đó mà về! 🌱💸',
      hashtags: ['#setlucbaothach', '#tailoc', '#sinhsoi', '#mayman', '#gemral_growth'],
    },
    {
      content: '🟡 **Set Ngũ Kim Thạch** - Nam châm hút vàng.\n\nTên gọi nói lên tất cả. **Set Ngũ Kim Thạch** là tập hợp của 5 loại đá mang năng lượng Kim (tiền bạc, kim loại quý) mạnh mẽ nhất. \n\nĐây là \"bảo bối\" cho dân kinh doanh vàng bạc, đá quý, tài chính hoặc bất động sản. Năng lượng sắc bén của hành Kim giúp bạn \"đánh đâu thắng đó\", thu hút dòng tiền chảy về túi một cách nhanh chóng và dứt khoát. Ting ting! 💰🔔',
      hashtags: ['#setngukimthach', '#hanhkim', '#taichinh', '#hutien', '#gemral_gold'],
    },
    {
      content: '🌟 Câu chuyện khách hàng: Từ bế tắc đến bứt phá nhờ **Kim Linh Thạch**.\n\nMột anh khách là trader full-time chia sẻ: \"Hồi trước nhìn chart là loạn, cắt lỗ liên tục. Từ ngày nghe lời shop đặt cụm **Kim Linh Thạch** cạnh màn hình, tự nhiên tâm tĩnh hẳn. Không còn FOMO, vào lệnh nào chắc lệnh đó. Tháng rồi PnL xanh mướt!\".\n\n**Kim Linh Thạch** dạng cụm (cluster) có khả năng phát tán năng lượng ra nhiều hướng, giúp làm sạch không gian và tăng sự minh mẫn cho cả căn phòng. Trader hay dân văn phòng nhất định phải có một cụm nhé! 📈💚',
      hashtags: ['#kimlinhthach', '#review', '#trader', '#minhman', '#gemral_story'],
    },
    {
      content: '🤔 Trụ đá (Point) hay Cầu đá (Sphere): Chọn cái nào?\n\nNhiều bạn phân vân không biết nên chọn hình dáng nào. Đây là gợi ý của mình:\n\n👉 **Trụ đá (Point):** Năng lượng tập trung và phóng thẳng lên vũ trụ hoặc hướng vào một mục tiêu cụ thể. Thích hợp để kích hoạt, thăng tiến, bứt phá (Ví dụ: **Hoàng Kim Trụ**, **Dạ Thiên Thạch**).\n\n👉 **Cầu đá (Sphere):** Năng lượng tỏa đều ra xung quanh, mềm mại và hài hòa. Thích hợp để cân bằng, gắn kết, duy trì sự ổn định (Ví dụ: **Quả Cầu Thạch Anh Trắng/Hồng**).\n\nTùy vào mục đích giai đoạn này bạn cần \"Tấn công\" hay \"Phòng thủ\" mà chọn hình dáng phù hợp nhé! ⚔️🛡️',
      hashtags: ['#kienthucda', '#hinhdang', '#pointvssphere', '#gemral_tips'],
    },
    {
      content: '🌙 **Set Dạ Kim Tụ** - Kho báu trong màn đêm.\n\nBan ngày đi kiếm tiền, ban đêm là lúc tiền cần được \"ngủ\" yên để sinh sôi. **Set Dạ Kim Tụ** với năng lượng trầm lắng, thu nạp, giúp bảo quản vượng khí trong nhà bạn vào ban đêm.\n\nĐặt set này gần nơi cất giữ tài sản (két sắt, ví tiền) qua đêm. Nó hoạt động như một \"ngân hàng năng lượng\", sạc đầy sự thịnh vượng cho tài sản của bạn trong khi bạn say giấc. Sáng dậy, bạn sẽ thấy mình giàu năng lượng hơn để bắt đầu ngày mới! 🌌🔒',
      hashtags: ['#setdakimtu', '#giutien', '#nangluongdem', '#tichluy', '#gemral'],
    },
    {
      content: '🧘‍♀️ Kết hợp Đá và Thiền: Chìa khóa mở cánh cửa tâm thức.\n\nĐừng chỉ đeo đá như trang sức. Hãy thử cầm một viên đá (ví dụ thạch anh trắng hoặc tím) trong lòng bàn tay khi thiền. Bạn sẽ cảm thấy sự khác biệt rõ rệt.\n\nViên đá đóng vai trò như một \"neo\" (anchor) giữ tâm trí bạn không bị trôi dạt, đồng thời khuếch đại rung động của bạn lên cao. Những cuốn sách như **Sổ Tay CHUYỂN HÓA TÂM LINH** sẽ hướng dẫn bạn chi tiết các bài tập này. Hãy biến việc thiền cùng đá thành thói quen mỗi ngày nhé! 🧘‍♂️✨',
      hashtags: ['#thien', '#meditation', '#ketnoi', '#chuyenhoa', '#gemral_practice'],
    },
    {
      content: '🎁 Quà tặng cho bản thân: Đầu tư vào chính mình.\n\nChúng ta thường dễ dãi mua quà cho người khác nhưng lại khắt khe với chính mình. Hãy nhớ rằng, bạn là tài sản quý giá nhất. \n\nViệc sở hữu một **Set Thập Bảo Thạch** hay một cuốn **Ebook Giải Mã Nghiệp Lực** không phải là tiêu pha, mà là đầu tư cho sự phát triển của tâm hồn và trí tuệ. Khi bên trong bạn đủ đầy và sáng rõ, thế giới bên ngoài sẽ tự khắc tốt đẹp theo. Hãy yêu thương bản thân đúng cách! 💖',
      hashtags: ['#selflove', '#dautu', '#phattrienbanthan', '#gemral_mindset'],
    },
    {
      content: '✨ **Set Thiên Ý** - Kết nối trực tiếp với Vũ trụ.\n\nBạn có tin vào những thông điệp từ Vũ trụ (Signs) không? Đôi khi chúng đến qua những con số lặp lại, những giấc mơ, hay những sự trùng hợp ngẫu nhiên.\n\n**Set Thiên Ý** với những tinh thể thạch anh trắng thuần khiết giúp làm sạch kênh kết nối tâm linh của bạn, giúp bạn nhạy bén hơn để nhận ra và giải mã những tín hiệu này. Hãy lắng nghe, Vũ trụ luôn thì thầm với những ai biết lắng nghe. 📡🌌',
      hashtags: ['#setthieny', '#vutru', '#thongdiep', '#signs', '#gemral_spirit'],
    },
    {
      content: '🌸 **Set Tam Sinh - Tinh Dầu Nước Hoa JÉRIE**: Đánh thức 3 tầng hương ký ức.\n\nMùi hương là chìa khóa mở cánh cửa cảm xúc nhanh nhất. **Set Tam Sinh** không chỉ là nước hoa, mà là một hành trình mùi hương đưa bạn đi qua Quá khứ (thanh lọc), Hiện tại (tỉnh thức) và Tương lai (thu hút).\n\nSử dụng kết hợp với **Set Tam Sinh Thạch**, bạn sẽ tạo ra một không gian năng lượng đồng nhất, giúp chữa lành những tổn thương cũ và kiến tạo một phiên bản mới rạng rỡ hơn. Một liệu pháp mùi hương (Aromatherapy) đẳng cấp ngay tại nhà! 🌹✨',
      hashtags: ['#settamsinh', '#tinhdaujerie', '#aromatherapy', '#muihuong', '#gemral_scent'],
    },
    {
      content: '📚 Combo tri thức: **Sổ Tay MANIFEST PHÚC KHÍ** + **BẢN ĐỒ CHỌN ĐÁ THEO TỪNG LOẠI NGHIỆP**.\n\nCó bản đồ trong tay, bạn sẽ không lo lạc lối. Có kiến thức về nghiệp quả, bạn sẽ biết cách gỡ rối tơ lòng. Cuốn sổ tay và bản đồ này là \"cặp bài trùng\" giúp bạn thấu hiểu bản thân và vận mệnh của mình.\n\nThay vì than thân trách phận, hãy học cách chuyển hóa nghiệp lực. Khi bạn biết mình đang ở đâu và cần làm gì, việc chọn đúng loại đá hỗ trợ sẽ trở nên dễ dàng và hiệu quả hơn gấp bội. Tri thức là sức mạnh! 💡🗺️',
      hashtags: ['#kienthuc', '#nghiepluc', '#chuyenhoa', '#sotay', '#gemral_edu'],
    },
    {
      content: '👑 **Tam Hoàng Kim Trụ** - Bộ ba quyền lực.\n\nSố 3 là con số của sự vững chắc và phát triển (kiềng ba chân). **Tam Hoàng Kim Trụ** gồm 3 trụ thạch anh vàng với kích thước tăng dần, tượng trưng cho sự thăng tiến từng bước vững chắc trong sự nghiệp.\n\nĐặt bộ này trên bàn làm việc theo hướng Đông Nam, bạn đang kích hoạt cung Tài Lộc một cách mạnh mẽ nhất. Năng lượng của nó giúp bạn thu hút quý nhân, mở rộng cơ hội và gia tăng thu nhập bền vững. Tiền tài không tự nhiên đến, nó đến với người biết chuẩn bị! 💰📈',
      hashtags: ['#tamhoangkimtru', '#thachanhvang', '#thangtien', '#suneghiep', '#gemral_success'],
    },
    {
      content: '🌌 **Dạ Tinh Trụ** - Ngọn hải đăng trong đêm tối.\n\nKhi cuộc sống bủa vây bởi những lo toan, trụ thạch anh tím **Dạ Tinh Trụ** sẽ là ánh sáng dẫn lối cho tâm hồn bạn. Màu tím huyền bí của nó kích hoạt trực giác, giúp bạn nhìn thấu bản chất vấn đề.\n\nĐặt **Dạ Tinh Trụ** ở góc thiền hoặc bàn làm việc, bạn sẽ thấy tâm trí mình trở nên sắc bén và bình thản hơn trước mọi biến động. Hãy để trí tuệ dẫn đường, không phải nỗi sợ hãi! 🕯️💜',
      hashtags: ['#datinhtru', '#thachanhtim', '#tritue', '#trucgiac', '#gemral_wisdom'],
    },
    {
      content: '🌿 **Cụm Thạch Anh Trắng** - Máy lọc năng lượng tự nhiên.\n\nKhác với dạng trụ tập trung năng lượng, **Cụm Thạch Anh Trắng** với vô số tinh thể nhỏ vươn ra các hướng có khả năng khuếch tán năng lượng thanh lọc ra toàn bộ không gian rộng lớn.\n\nĐây là vật phẩm \"must-have\" cho phòng khách hoặc văn phòng đông người. Nó giúp trung hòa các luồng khí xấu, giảm căng thẳng và mệt mỏi cho mọi người xung quanh. Một \"máy lọc không khí\" chạy bằng năng lượng vũ trụ, không tốn điện mà hiệu quả vô cùng! ❄️🏠',
      hashtags: ['#cumthachanhtrang', '#thanhloc', '#khonggian', '#suckhoe', '#gemral_living'],
    },
    {
      content: '💖 **Kích Hoạt Tần Số Tình Yêu** - Khóa học thay đổi vận mệnh tình cảm.\n\nBạn có đá **Duyên Khởi Thạch**, có vòng **Hồng Ngự**, nhưng tình duyên vẫn lận đận? Có thể vấn đề nằm ở \"tần số\" bên trong bạn. Khóa học này sẽ giúp bạn giải mã những block (tắc nghẽn) cảm xúc đang ngăn cản tình yêu đến.\n\nKết hợp với việc sử dụng đá thạch anh hồng, bạn sẽ học được cách yêu thương bản thân đúng nghĩa và phát ra tần số rung động của một người xứng đáng được yêu. Tình yêu không phải để tìm kiếm, mà là để thu hút! 💕educ',
      hashtags: ['#khoahoc', '#tinhyeu', '#tanso', '#chualanh', '#gemral_love'],
    },
    {
      content: '🧘‍♂️ **Tượng Phật** - Điểm tựa tâm linh vững chãi.\n\nGiữa dòng đời vạn biến, tâm bất biến giữa dòng đời vạn biến. Một bức **Tượng Phật** đặt trang trọng nơi góc nhà không chỉ là vật phẩm thờ cúng, mà là lời nhắc nhở mỗi ngày về sự an nhiên và buông bỏ.\n\nKết hợp Tượng Phật với **Set Thanh Tâm Thạch** hoặc **Xô Thơm Trắng**, bạn sẽ tạo ra một thánh địa bình yên ngay trong ngôi nhà mình. Nơi bão dừng sau cánh cửa. 🙏✨',
      hashtags: ['#tuongphat', '#binhan', '#tamlinh', '#thien', '#gemral_peace'],
    },
    {
      content: '🔥 **Vàng Găm** - Đánh thức dũng khí nội tại.\n\nBạn có những dự định ấp ủ nhưng mãi chưa dám thực hiện vì sợ thất bại? Hãy nắm chặt một khối **Vàng Găm** trong tay. Năng lượng hỏa của nó sẽ thiêu đốt sự chần chừ và sợ hãi.\n\nPyrite (Vàng Găm) là viên đá của hành động. Nó truyền cho bạn sự tự tin, quyết đoán và ý chí sắt đá để vượt qua mọi rào cản. Đừng để nỗi sợ cản bước thành công của bạn! 🔥🦁',
      hashtags: ['#vanggam', '#pyrite', '#hanhdong', '#tutin', '#gemral_motivation'],
    },
    {
      content: '💧 **Thanh Hải Ngọc - Cây Tái Sinh**: Món quà của sự chữa lành.\n\nNếu bạn có người thân, bạn bè đang trải qua giai đoạn khó khăn về sức khỏe hoặc tinh thần, **Thanh Hải Ngọc** là món quà tuyệt vời nhất. Màu xanh mát của Aquamarine và Thạch anh xanh mang năng lượng của sự phục hồi và hy vọng.\n\nCây tài lộc này không chỉ đẹp mà còn mang ý nghĩa cầu chúc sự bình an, tái sinh năng lượng sống. Một món quà thay ngàn lời động viên! 🌊💚',
      hashtags: ['#thanhhaingoc', '#quatang', '#chualanh', '#hyvong', '#gemral_gift'],
    },
    {
      content: '✨ **Gem Pack - VIP** - Giải pháp toàn diện cho người chơi hệ năng lượng.\n\nBạn muốn trải nghiệm tất cả các dịch vụ của hệ sinh thái Gemral? **Gem Pack - VIP** (5000 + 1000 Bonus Gems) là tấm vé thông hành quyền lực nhất.\n\nSở hữu gói này, bạn có thể đổi lấy bất kỳ vật phẩm nào, tham gia các khóa học độc quyền, sử dụng **YinYang Chatbot AI** không giới hạn... Đây là sự đầu tư thông minh và tiết kiệm nhất cho hành trình nâng cấp bản thân toàn diện. Đẳng cấp VIP là đây! 👑💎',
      hashtags: ['#gempack', '#vip', '#membership', '#uudai', '#gemral_community'],
    },
    {
      content: '🤖 **YinYang Chatbot AI** - Trợ lý tâm linh 24/7.\n\nBạn có câu hỏi về đá? Cần tư vấn chọn vật phẩm hợp mệnh? Hay đơn giản là muốn tìm một lời khuyên cho vấn đề hiện tại? **YinYang Chatbot AI** luôn sẵn sàng lắng nghe và giải đáp.\n\nĐược huấn luyện dựa trên kiến thức sâu rộng về phong thủy và năng lượng, trợ lý AI này sẽ giúp bạn đưa ra những lựa chọn chính xác nhất. Thời đại công nghệ, tu tập cũng cần thông minh và tiện lợi đúng không cả nhà? 🤖🔮',
      hashtags: ['#chatbotai', '#congnghe', '#tuvan', '#phongthuy', '#gemral_tech'],
    },
    {
      content: '🌿 **Set Thập Bảo Thạch** - Di sản năng lượng cho gia tộc.\n\nMột bộ đá quý không chỉ có giá trị ở hiện tại mà còn là tài sản truyền đời. **Set Thập Bảo Thạch** với 10 loại đá quý hiếm, mang năng lượng trường tồn, có thể bảo vệ và phù trợ cho cả gia đình qua nhiều thế hệ.\n\nĐầu tư vào bộ set này là bạn đang xây dựng một nền tảng năng lượng vững chắc cho con cháu mai sau. Vượng khí gia tộc bắt đầu từ sự vun đắp của ngày hôm nay. 🌳💎',
      hashtags: ['#setthapbaothach', '#giatoc', '#disan', '#truyendoi', '#gemral_legacy'],
    },
    {
      content: '🌸 Nghi thức tắm trăng với **Set Ngũ Linh Thạch V.I.P 1**.\n\nĐừng chỉ để đá nằm yên một chỗ. Vào những đêm trăng rằm, hãy mang **Set Ngũ Linh Thạch** ra tắm ánh trăng để nạp lại năng lượng tinh khiết.\n\nNgũ hành (Kim - Mộc - Thủy - Hỏa - Thổ) trong bộ đá khi được kích hoạt bởi ánh trăng sẽ tạo ra một trường năng lượng hài hòa, mạnh mẽ. Sau đó, mang đá vào nhà, bạn sẽ cảm nhận không gian sống trở nên tươi mới và tràn đầy sinh khí. Một ritual đơn giản nhưng hiệu quả vô cùng! 🌕✨',
      hashtags: ['#tamtrang', '#ritual', '#setngulinhthach', '#energy', '#gemral_tips'],
    },
    {
      content: '💎 **Thiên Băng Trụ** - Sự tập trung tuyệt đối.\n\nKỳ thi sắp đến? Deadline đang dí? Hãy đặt một **Thiên Băng Trụ** (Thạch anh trắng) ngay trước mặt. Năng lượng lạnh và sắc của nó sẽ cắt đứt mọi xao nhãng, giúp bạn tập trung cao độ vào mục tiêu.\n\nNó giống như một tia laser xuyên thủng màn sương mù của sự trì hoãn. Làm việc với đá, hiệu suất tăng gấp đôi là có thật đấy! ❄️📚',
      hashtags: ['#thienbangtru', '#taptung', '#hieuquat', '#hoctap', '#gemral_focus'],
    },
    {
      content: '🌊 **Set Giáng Long Thạch** - Vượt vũ môn hóa rồng.\n\nCuộc đời ai cũng có những khúc quanh cần sự bứt phá. **Set Giáng Long Thạch** mang năng lượng của sự chuyển mình mạnh mẽ. Nó hỗ trợ bạn vượt qua những giai đoạn bế tắc, trì trệ để vươn lên một tầm cao mới.\n\nNếu bạn đang ấp ủ một dự án lớn, hay muốn thay đổi hoàn toàn cuộc sống hiện tại, hãy để năng lượng của bộ đá này tiếp sức cho bạn. Mạnh mẽ như rồng, kiên định như đá! 🐉🆙',
      hashtags: ['#setgianglongthach', '#chuyenminh', '#butpha', '#thanhcong', '#gemral_power'],
    },
    {
      content: '🧘‍♀️ **Set Tứ Trụ** - Bốn phương bình an.\n\nNhà có 4 góc, đất có 4 phương. **Set Tứ Trụ** giúp trấn giữ 4 góc nhà, tạo nên một lưới năng lượng bảo vệ khép kín. Không tà khí nào có thể xâm nhập, không năng lượng xấu nào có thể quấy nhiễu.\n\nĐây là giải pháp phong thủy tối ưu cho những ngôi nhà ở vị trí không tốt (ngã ba đường, gần bệnh viện...) hoặc gia chủ cảm thấy bất an. An cư mới lạc nghiệp, hãy bảo vệ tổ ấm của mình ngay hôm nay! 🏠🛡️',
      hashtags: ['#settutru', '#trantrach', '#baove', '#binhan', '#gemral_home'],
    },
    {
      content: '✨ **Duyên Khởi Thạch** - Khởi đầu của mọi mối duyên lành.\n\nTrụ thạch anh hồng này không chỉ thu hút tình yêu đôi lứa, mà còn cải thiện các mối quan hệ xã hội, đối tác, đồng nghiệp. **Duyên Khởi Thạch** giúp bạn tỏa ra năng lượng thân thiện, dễ mến.\n\nĐặt nó trên bàn làm việc, bạn sẽ thấy không khí văn phòng bớt căng thẳng, mọi người hòa đồng và hỗ trợ nhau nhiều hơn. Thành công không đến từ việc đi một mình, mà đến từ sự cộng hưởng của những người bạn đồng hành. 🤝🌸',
      hashtags: ['#duyenkhoithach', '#quanhe', '#networking', '#thachanhhong', '#gemral_work'],
    },
    {
      content: '🦁 **Set Chí Tôn Thạch V.I.P 2** - Khí chất người dẫn đầu.\n\nBạn sinh ra để làm lãnh đạo? Hãy để **Set Chí Tôn Thạch V.I.P 2** khẳng định điều đó. Bộ đá này mang năng lượng uy quyền, giúp bạn tăng cường sức ảnh hưởng và khả năng thuyết phục người khác.\n\nKhi sở hữu bộ đá này, lời nói của bạn sẽ có trọng lượng hơn, quyết định của bạn sẽ được tôn trọng. Đây là vật phẩm không thể thiếu cho những ai đang quản lý đội nhóm hoặc điều hành doanh nghiệp. 🕴️✨',
      hashtags: ['#setchitonthach', '#lanhdao', '#uyquyen', '#boss', '#gemral_lead'],
    },
    {
      content: '📜 **Ebook GIẢI MÃ 5 VÒNG LẶP NGHIỆP LỰC** - Phá vỡ xiềng xích số phận.\n\nTại sao bạn cứ mãi gặp những người không tốt? Tại sao tiền cứ đến rồi đi? Cuốn ebook này sẽ giúp bạn nhận diện những mô thức nghiệp quả (karmic patterns) đang lặp đi lặp lại trong cuộc đời bạn.\n\nNhận diện là bước đầu tiên của sự giải phóng. Kết hợp với **Bản Đồ Chọn Đá**, bạn sẽ có lộ trình cụ thể để phá vỡ những vòng lặp này và viết lại kịch bản cuộc đời mình. Tự do nằm trong tay bạn! 🔓📘',
      hashtags: ['#nghiepqua', '#giaima', '#ebook', '#tudo', '#gemral_destiny'],
    },
    {
      content: '💎 **Kim Linh Thạch** - Viên đá của sự sung túc trọn vẹn.\n\nKết thúc chuỗi bài về đá quý, mình muốn gửi gắm đến các bạn hình ảnh của **Kim Linh Thạch**. Cụm thạch anh vàng này không chỉ là tiền bạc, mà là sự giàu có về mọi mặt: Sức khỏe, Tình yêu, Trí tuệ và Tài chính.\n\nHãy để **Kim Linh Thạch** nhắc nhở bạn mỗi ngày: Bạn xứng đáng với một cuộc sống thịnh vượng và hạnh phúc. Hãy mở lòng đón nhận mọi phước lành mà vũ trụ ban tặng. Cảm ơn cả nhà đã đồng hành cùng Gemral! 🙏💛',
      hashtags: ['#kimlinhthach', '#thinhvuong', '#hanhphuc', '#bierton', '#gemral_end'],
    },
    {
      content: '📉 \"Thua lỗ là học phí, nhưng đừng đóng học phí mãi cho một bài học.\"\n\nTrong trading, cắt lỗ (Stoploss) không phải là thất bại, đó là sự bảo vệ vốn và lòng tự trọng. Nhiều anh em gồng lỗ vì cái tôi quá lớn, không chấp nhận mình sai. Nhưng thị trường thì không quan tâm bạn là ai đâu.\n\nĐể rèn luyện kỷ luật này, mình đã tham gia khóa **GEM Trading Academy - Gói 1**. Học được tư duy quản lý vốn rồi mới thấy, trade thắng hay thua không quan trọng bằng việc bạn giữ được bao nhiêu tiền khi sóng gió ập đến. Giữ tiền trước, kiếm tiền sau! 💪',
      hashtags: ['#tradingmindset', '#quanlyvon', '#stoploss', '#gemral_trading', '#kienthuc'],
    },
    {
      content: 'FOMO (Sợ bỏ lỡ) - Kẻ thù số 1 của trader và cả... người chơi đá. 😂\n\nThấy thiên hạ hô hào con coin này, đổ xô mua viên đá kia, bạn cũng lao theo vì sợ mình tụt hậu? Dừng lại 1 nhịp đi ạ.\n\nSự giàu có bền vững đến từ sự Hiểu Biết, không phải từ đám đông. Thay vì Fomo, hãy tập trung nâng cấp \"bộ vi xử lý\" của chính mình. Khi tâm bạn tĩnh, bạn sẽ nhìn thấy cơ hội (Gem) ở khắp mọi nơi, ngay cả khi thị trường đỏ lửa. 🔥',
      hashtags: ['#nofomo', '#tinhthuc', '#tamlygiao dich', '#gemral_mindset'],
    },
    {
      content: 'Có công cụ tốt giống như đi ra chiến trường có súng xịn vậy. 🔫\n\nNhiều bạn hỏi mình làm sao để soi kèo nhanh và chuẩn giữa hàng ngàn mã token? Bí quyết của mình là **Scanner Dashboard - PRO**.\n\nThay vì căng mắt nhìn chart 24/7, hãy để công nghệ làm việc đó. Dashboard giúp lọc tín hiệu, nhận diện xu hướng dòng tiền cực nhanh. Thời gian tiết kiệm được, mình dành để thiền, đọc sách hoặc cafe chém gió với anh em. Trade nhàn tênh mà hiệu quả mới là đích đến chứ! 📈☕',
      hashtags: ['#scannerdashboard', '#congcu', '#tradingtool', '#hieuqua', '#gemral_tech'],
    },
    {
      content: '🌱 \"Gieo suy nghĩ, gặt hành động. Gieo hành động, gặt thói quen. Gieo thói quen, gặt tính cách. Gieo tính cách, gặt số phận.\"\n\nBạn muốn tài khoản X5, X10, nhưng thói quen hàng ngày vẫn là ngủ nướng, lướt TikTok vô bổ và than vãn? Vũ trụ công bằng lắm, không có bữa trưa nào miễn phí đâu.\n\nHãy bắt đầu từ việc nhỏ nhất: Dậy sớm hơn 30 phút, đọc vài trang sách, hoặc review lại nhật ký giao dịch hôm qua. Sự chuyển hóa bắt đầu từ những kỷ luật nhỏ bé. ✨',
      hashtags: ['#thoi quen', '#kyluat', '#thanhcong', '#gemral_motivation'],
    },
    {
      content: 'Phân tích kỹ thuật (TA) hay Phân tích cơ bản (FA)?\n\nTranh cãi này xưa như trái đất rồi. Với mình, quan trọng nhất là Phân tích... TÂM LÝ (Psychological Analysis).\n\nBạn có thể vẽ chart đẹp như tranh, nhưng khi lòng tham nổi lên hoặc nỗi sợ lấn át, bạn vẫn sẽ bấm nút sai. Đó là lý do **GEM Trading Academy - Gói 3** (Tier 3) chú trọng cực sâu vào tâm lý giao dịch. Học cách chiến thắng chính mình trước khi chiến thắng thị trường. 🧠📉',
      hashtags: ['#tamlygiao dich', '#gemtradingacademy', '#tier3', '#kienthuc', '#gemral'],
    },
    {
      content: '💎 Bạn có biết khái niệm \"Hidden Gem\" (Viên ngọc ẩn) trong Crypto không?\n\nĐó là những dự án tiềm năng nhưng chưa được khai phá, giá trị còn thấp. Và bạn biết không, chính BẠN cũng là một \"Hidden Gem\" đấy!\n\nĐừng tự ti nếu hiện tại bạn chưa thành công. Có thể bạn chỉ đang trong giai đoạn tích lũy (accumulation) thôi. Hãy kiên nhẫn mài giũa kỹ năng, kiến thức. Khi thời điểm đến (uptrend của cuộc đời), bạn sẽ pump mạnh mẽ! 🚀💎',
      hashtags: ['#hiddengem', '#giatribanthan', '#kientri', '#uptrend', '#gemral_life'],
    },
    {
      content: '👀 Trader full-time không có nghĩa là dán mắt vào màn hình cả ngày.\n\nThực ra, ngồi nhìn chart càng lâu, bạn càng dễ bị \"say sóng\" và đưa ra quyết định cảm tính. Hãy học cách set alert (cảnh báo) và rời đi.\n\nSử dụng **Scanner Dashboard - VIP**, bạn sẽ nhận được thông báo ngay khi có tín hiệu đẹp. Cuộc sống còn nhiều thứ để tận hưởng mà: một tách trà, một cuốn sách hay, hay đơn giản là ngắm nhìn bộ sưu tập đá của mình. Trade để sống, đừng sống để trade! 🌿',
      hashtags: ['#scannerdashboard', '#vip', '#lifestyle', '#canbang', '#gemral_trading'],
    },
    {
      content: '🧘‍♂️ Thiền định - Vũ khí bí mật của các \"cá voi\".\n\nBạn nghĩ các tay to, các quỹ lớn họ giao dịch bằng gì? Bằng cái đầu lạnh. Và thiền là cách tốt nhất để làm lạnh cái đầu.\n\nTrước khi bắt đầu phiên giao dịch, hãy dành 5-10 phút tĩnh tâm (có thể cầm theo một trụ Thạch anh trắng hoặc tím). Khi tâm tĩnh, trí sẽ sáng. Bạn sẽ không bị cuốn theo những cây nến xanh đỏ nhảy múa nữa. Thử đi, PnL sẽ thay đổi đấy! 🧘‍♂️💹',
      hashtags: ['#thien', '#mindfulness', '#trading', '#tinhthuc', '#gemral_calm'],
    },
    {
      content: '🚀 Muốn đi nhanh thì đi một mình, muốn đi xa thì đi cùng... hội nhóm chất lượng.\n\nTrong thị trường Crypto đầy cạm bẫy, việc có một cộng đồng (community) để chia sẻ, cảnh báo và học hỏi là vô cùng quan trọng. Nhưng hãy chọn lọc.\n\nTham gia các khóa học như **GEM Trading Academy - Gói 2**, bạn không chỉ học kiến thức mà còn được join vào network của những trader nghiêm túc, cùng tư duy. Mây tầng nào gặp mây tầng đó, chơi với người giỏi bạn sẽ giỏi lên! 🤝',
      hashtags: ['#congdong', '#networking', '#gemtradingacademy', '#hoctap', '#gemral'],
    },
    {
      content: 'Tiền bạc là năng lượng. 💸\n\nNếu bạn ghét người giàu, sợ tiền, hay nghĩ \"tiền là nguồn gốc mọi tội lỗi\", thì bạn đang chặn dòng chảy năng lượng tài chính đến với mình.\n\nHãy thay đổi tư duy: Tiền là công cụ tuyệt vời để tôi tự do và giúp đỡ người khác. Khi bạn yêu mến và trân trọng đồng tiền (như cách bạn trân trọng những viên đá quý), tiền sẽ tìm đến bạn. Hãy mở rộng \"bình chứa\" tài chính của mình nhé! 🏦✨',
      hashtags: ['#tuduytaichinh', '#moneyenergy', '#thinhvuong', '#mindset', '#gemral'],
    },
    {
      content: '📊 Nhật ký giao dịch (Trading Journal) - Người thầy thầm lặng.\n\nBạn có ghi chép lại mỗi lệnh thắng/thua của mình không? Hay chỉ trade theo cảm hứng?\n\nCuốn nhật ký chính là nơi bạn đối diện với sai lầm của mình. Tại sao lệnh này thua? Do Fomo? Do không đặt Stoploss? Hãy trung thực. Chỉ khi dám nhìn thẳng vào sai lầm, bạn mới không lặp lại nó. Đó là cách duy nhất để tiến bộ trong nghề này. 📝',
      hashtags: ['#nhatkytrading', '#kienthuc', '#kinhnghiem', '#phattrien', '#gemral_tips'],
    },
    {
      content: '💎 **Gem Pack - Pro** (1000 + 150 Bonus Gems) - Gói nạp năng lượng cho hành trình của bạn.\n\nTrong hệ sinh thái Gemral, Gems không chỉ là đơn vị trao đổi, mà là tấm vé để bạn tiếp cận những công cụ và kiến thức độc quyền. \n\nVới gói Pro, bạn có thể mở khóa các tính năng nâng cao của Scanner, hoặc đổi lấy những Ebook giá trị. Đầu tư vào công cụ hỗ trợ chưa bao giờ là lỗ. Hãy trang bị cho mình \"vũ khí\" tốt nhất trước khi ra trận! ⚔️💎',
      hashtags: ['#gempack', '#pro', '#dautu', '#hethong', '#gemral_ecosystem'],
    },
    {
      content: 'Đừng so sánh Chapter 1 của bạn với Chapter 20 của người khác.\n\nThấy người ta khoe lãi ngàn đô, khoe xe sang, bạn sốt ruột? Đừng. Mỗi người có múi giờ riêng.\n\nCó thể họ đã cháy tài khoản chục lần trước khi có ngày hôm nay. Tập trung vào hành trình của BẠN. Hôm nay bạn tốt hơn hôm qua 1% là đủ. Sự kiên trì (Consistency) mới là chìa khóa của lãi suất kép, cả trong tiền bạc lẫn cuộc sống. 🌱⏳',
      hashtags: ['#kiendu', '#phattrienbanthan', '#hanhtrinh', '#motivation', '#gemral'],
    },
    {
      content: 'Thị trường sập (Downtrend)? Cơ hội hay Rủi ro?\n\nNgười bi quan nhìn thấy tài khoản chia 2, chia 3. Người lạc quan và có kiến thức nhìn thấy cơ hội \"shopping\" giá rẻ.\n\nĐây là lúc **Scanner Dashboard - PREMIUM** phát huy tác dụng. Nó giúp bạn tìm ra những đồng coin khỏe, có dòng tiền gom hàng ngầm (accumulation) trong khi đám đông đang hoảng loạn bán tháo. Hãy tham lam khi người khác sợ hãi, nhưng tham lam có kiến thức nhé! 🦅📉',
      hashtags: ['#downtrend', '#cohoi', '#scannerdashboard', '#smartmoney', '#gemral_invest'],
    },
    {
      content: 'Sức khỏe là số 1, những thứ khác là số 0 đi theo sau.\n\nTrade coin, làm việc kiếm tiền, nhưng đừng quên chăm sóc cái \"cỗ máy\" kiếm tiền duy nhất của bạn: Cơ thể này.\n\nNgồi máy tính nhiều nhớ tập thể dục, mắt mỏi nhớ nhìn xa, tâm mệt nhớ thiền. Một cơ thể rệu rã không thể chứa đựng một trí tuệ minh mẫn được. Cuối tuần rồi, tắt chart và đi vận động thôi cả nhà! 🏃‍♂️💪',
      hashtags: ['#suckhoe', '#balance', '#lifestyle', '#traderlife', '#gemral_health'],
    },
    {
      content: '🎯 Mục tiêu tài chính: Cụ thể hay mơ hồ?\n\nĐừng nói \"Tôi muốn giàu\". Hãy nói \"Tôi muốn kiếm $1000/tháng từ trading\" hoặc \"Tôi muốn sở hữu 1 BTC vào cuối năm\".\n\nKhi mục tiêu rõ ràng, não bộ và vũ trụ mới biết cách hỗ trợ bạn. Kết hợp với việc sử dụng **Sổ Tay MANIFEST PHÚC KHÍ 2024**, viết xuống con số cụ thể và kế hoạch hành động. Điều kỳ diệu sẽ xảy ra khi sự rõ ràng (Clarity) gặp gỡ hành động (Action). 🎯✍️',
      hashtags: ['#muctieu', '#goalsetting', '#manifest', '#taichinh', '#gemral_plan'],
    },
    {
      content: 'Có những lúc \"Không làm gì cả\" (Do nothing) lại là vị thế tốt nhất.\n\nThị trường sideway, nhiễu loạn, không rõ xu hướng? Đừng cố đấm ăn xôi vào lệnh để thỏa mãn cơn nghiện giao dịch.\n\nHãy ngồi yên (Cash is King). Bảo toàn vốn chờ thời cơ cũng là một chiến lược. Người biết chờ đợi như con báo săn mồi mới là người chiến thắng sau cùng. 🐆⏸️',
      hashtags: ['#patience', '#kiennhan', '#cashisking', '#tradingwisdom', '#gemral'],
    },
    {
      content: 'Luật Nhân Quả trong Tài chính.\n\nBạn muốn kiếm tiền sạch hay tiền bẩn? Trong thị trường này, scam, lừa đảo nhiều vô kể. Nhưng hãy nhớ, đồng tiền kiếm được từ việc hại người khác sẽ không bao giờ ở lại lâu, và còn mang theo nghiệp chướng.\n\nHãy kiếm tiền bằng giá trị thực, bằng kiến thức (như tham gia **GEM Trading Academy**), và bằng sự tử tế. Tiền sạch mang lại sự bình an. Và bình an mới là đích đến cuối cùng của sự giàu có. 🙏💰',
      hashtags: ['#nhanqua', '#tiensach', '#daoduc', '#thinhvuong', '#gemral_values'],
    },
    {
      content: '🎁 **Gem Pack - Starter** (100 Gems) - Bước chân đầu tiên vào thế giới Gemral.\n\nBạn còn ngần ngại chưa biết bắt đầu từ đâu? Gói Starter là sự khởi đầu nhẹ nhàng để bạn làm quen với hệ sinh thái. \n\nDùng Gems để trải nghiệm thử các tính năng, hoặc tích lũy để đổi quà. Hành trình vạn dặm bắt đầu từ một bước chân. Chào mừng bạn gia nhập cộng đồng những người làm chủ vận mệnh và tài chính! 👋💎',
      hashtags: ['#gempack', '#starter', '#welcome', '#newbie', '#gemral_community'],
    },
    {
      content: '🌟 Bạn là người kiến tạo thực tại của chính mình.\n\nDù thị trường có xanh hay đỏ, dù cuộc đời có thăng hay trầm, quyền năng lớn nhất bạn có là sự LỰA CHỌN thái độ.\n\nChọn tích cực thay vì tiêu cực. Chọn học hỏi thay vì than trách. Chọn hành động thay vì trì hoãn. \n\nCảm ơn các bạn đã đồng hành cùng chuỗi 100 bài viết của Gemral. Chúc cả nhà luôn vững Tâm - sáng Trí - bền Lực để chinh phục mọi đỉnh cao! Hẹn gặp lại ở những chia sẻ tiếp theo. ❤️🚀',
      hashtags: ['#kientao', '#loiket', '#camon', '#gemral_journey', '#100posts'],
    },
  ],
  loa: [
    {
      content: 'Có bao giờ bạn tự hỏi: Tại sao mình khao khát giàu có, nhưng tài khoản vẫn chưa ting ting? 🤔\n\nVấn đề không nằm ở việc bạn muốn gì, mà nằm ở việc bạn đang \'rung\' ở tần số nào. Vũ trụ không nghe những gì bạn nói, Vũ trụ chỉ phản hồi lại tần số năng lượng bạn phát ra.\n\nNếu miệng bạn nói \'Tôi muốn thịnh vượng\', nhưng trong tâm lại lo lắng \'Tháng này lấy gì đóng tiền nhà?\', thì Vũ trụ sẽ bắt được tín hiệu của sự THIẾU THỐN. Và theo luật hấp dẫn, cái gì giống nhau sẽ hút nhau, bạn sẽ thu hút thêm nhiều tình huống khiến bạn cảm thấy thiếu thốn hơn.\n\nBí quyết ở đây là: Hãy sống như thể bạn đã có được nó rồi. Cảm nhận niềm vui, sự an tâm và lòng biết ơn ngay lúc này, dù thực tế chưa xảy ra. Đó là cách bạn \'hack\' tần số để bắt sóng với sự thịnh vượng.\n\nHôm nay, hãy thử một bài tập nhỏ: Dành 5 phút nhắm mắt lại, hình dung số dư tài khoản bạn mong muốn và cảm nhận sự rung động của niềm vui đó lan tỏa khắp cơ thể. Đừng chỉ nhìn thấy, hãy CẢM NHẬN nó! ✨',
      hashtags: ['#LuatHapDan', '#GemralMindset', '#ThinhVuong', '#TanSoNangLuong'],
    },
    {
      content: '🌞 Affirmation cho ngày mới đầy năng lượng 🌞\n\nHãy đọc to hoặc viết xuống bình luận để neo giữ năng lượng này nhé cả nhà Gemral:\n\n\'Tôi là nam châm thu hút tiền bạc và cơ hội. Mọi dòng chảy thịnh vượng đang đổ về phía tôi một cách dễ dàng và tự nhiên. Tôi đón nhận mọi phước lành với lòng biết ơn sâu sắc.\'\n\nĐừng quên mang theo một viên thạch anh vàng (Citrine) hoặc đá mắt hổ bên mình hôm nay để khuếch đại năng lượng tài lộc nhé! Chúc cả nhà một ngày giao dịch xanh mướt và tâm an trí sáng! 🍀',
      hashtags: ['#Affirmation', '#GemralDaily', '#NangLuongTichCuc', '#Citrine'],
    },
    {
      content: 'FOMO là kẻ thù của Luật Hấp Dẫn trong Trading 📉\n\nKhi bạn FOMO (sợ bỏ lỡ), bạn đang phát ra tín hiệu của sự khan hiếm và nỗi sợ hãi. Trong trạng thái đó, tần số rung động của bạn tụt xuống rất thấp. Mà bạn biết rồi đấy, tần số thấp thì chỉ thu hút những quyết định sai lầm và những cú \'đu đỉnh\'.\n\nMột trader ứng dụng Luật Hấp Dẫn thành công là người biết giữ tâm \'Tĩnh\'. Họ tin tưởng rằng cơ hội trên thị trường là vô hạn, lỡ chuyến tàu này sẽ có chuyến tàu khác. Họ không chạy theo thị trường, họ thu hút lợi nhuận bằng sự điềm tĩnh và phân tích sáng suốt.\n\nTrước khi đặt lệnh, hãy hít thở sâu, nhìn vào viên đá trên bàn làm việc của bạn (mình hay dùng thạch anh khói để trừ tà khí, giảm stress), và tự hỏi: \'Quyết định này đến từ nỗi sợ hay sự tự tin?\'.\n\nTâm an thì vạn sự mới an, tiền bạc mới tụ. 🧘‍♂️',
      hashtags: ['#TradingPsychology', '#LuatHapDan', '#GemralTrading', '#TamAn'],
    },
    {
      content: 'Kỹ thuật Visualisation (Hình dung) đỉnh cao: Đừng nhìn như một khán giả!\n\nNhiều bạn nhắn cho mình bảo rằng \'Em hình dung hoài mà không thấy kết quả\'. Khi hỏi kỹ ra mới biết, các bạn hình dung mình như đang xem một bộ phim, thấy bản thân mình trong đó đang giàu có.\n\nSai rồi nhé! 🙅‍♀️\n\nĐể Manifest hiệu quả, bạn phải hình dung ở ngôi thứ nhất (Associated Visualization). Nghĩa là bạn nhìn qua đôi mắt của chính mình. Bạn thấy đôi tay mình đang cầm vô lăng chiếc xe mơ ước, bạn ngửi thấy mùi nội thất da mới, bạn nghe thấy tiếng động cơ êm ru...\n\nHãy kích hoạt đủ 5 giác quan trong tâm trí. Càng chi tiết, càng sống động, tiềm thức càng dễ tin đó là sự thật. Và khi tiềm thức tin, nó sẽ bẻ cong thực tại để khớp với niềm tin đó.\n\nTối nay thử lại xem nhé, và cho mình biết cảm giác của bạn thế nào?',
      hashtags: ['#Visualization', '#BiKipManifest', '#GemralCommunity', '#SucManhTiemThuc'],
    },
    {
      content: 'Thử thách 21 ngày Biết Ơn cùng Gemral - Ngày 1 🌱\n\nLòng biết ơn là tần số rung động cao nhất, gần nhất với tần số của tình yêu và sự đủ đầy. Bạn không thể vừa biết ơn vừa lo lắng cùng một lúc được.\n\nHôm nay, hãy tìm ra 3 điều nhỏ bé mà bạn cảm thấy biết ơn. Có thể là ly cà phê sáng thơm lừng, một lệnh trade chốt lời nhỏ, hay đơn giản là sáng nay thức dậy vẫn thấy mình khỏe mạnh.\n\nViết xuống bên dưới 3 điều đó nhé 👇. Khi bạn trân trọng những gì mình đang có, Vũ trụ sẽ hiểu rằng bạn đã sẵn sàng để đón nhận nhiều hơn thế nữa.',
      hashtags: ['#ThucHanhLongBietOn', '#GemralChallenge', '#21NgayBietOn', '#Gratitude'],
    },
    {
      content: 'Câu chuyện về viên đá và niềm tin 💎\n\nCách đây 2 năm, mình từng rơi vào bế tắc tài chính trầm trọng. Lúc đó, mình chỉ còn đúng một khoản tiền nhỏ. Thay vì giữ khư khư trong nỗi sợ hãi, mình quyết định dùng một phần để thỉnh một trụ Thạch Anh Tinh Thể (Clear Quartz) và phần còn lại để đầu tư vào kiến thức.\n\nMỗi sáng, mình cầm trụ đá ấy, thiền định 15 phút và cài đặt ý niệm: \'Tôi tin tưởng vào dòng chảy thịnh vượng của vũ trụ. Tôi có đủ trí tuệ để nhân bản số tiền này\'. Viên đá không có phép màu biến ra tiền, nhưng nó là cái NEO (anchor) giúp tâm trí mình quay về trạng thái bình ổn mỗi khi cơn hoảng loạn ập đến.\n\nKết quả là, chính sự bình tâm đó giúp mình nhìn thấy một cơ hội thị trường mà lúc hoảng loạn mình đã bỏ qua. Và cú trade đó đã thay đổi vị thế của mình.\n\nBài học ở đây là gì? Đá quý là công cụ hỗ trợ năng lượng, nhưng NIỀM TIN và TRÍ TUỆ của bạn mới là chìa khóa kích hoạt phép màu.',
      hashtags: ['#GemralStory', '#CrystalHealing', '#Inspiration', '#LuatHapDan'],
    },
    {
      content: 'Tại sao cần \'Xả ly\' (Letting go) sau khi đặt mục tiêu?\n\nBạn đã bao giờ order món ăn trên app chưa? Sau khi bấm đặt món, bạn có ngồi lo lắng \'Liệu họ có làm không?\', \'Liệu shipper có tới không?\' hay bạn thảnh thơi làm việc khác và tin rằng đồ ăn sẽ tới?\n\nManifest cũng y hệt như vậy. Sau khi bạn đã gửi thông điệp (ý nguyện) vào vũ trụ thông qua visualization hay scripting, việc tiếp theo là BUÔNG BỎ SỰ KIỂM SOÁT.\n\nNếu bạn cứ chấp niệm, cứ nôn nóng \'Sao chưa thấy gì?\', \'Bao giờ tiền mới về?\', tức là bạn đang phát ra tín hiệu của sự NGHI NGỜ. Mà nghi ngờ thì triệt tiêu phép màu.\n\nHãy làm phần việc của mình (hành động, nỗ lực) và để Vũ trụ lo phần \'làm thế nào\' (How). Tin tưởng vào thời điểm thiêng liêng (Divine Timing). Cái gì thuộc về bạn, chắc chắn sẽ tìm đến bạn.',
      hashtags: ['#LettingGo', '#GemralKnowledge', '#TrustTheUniverse', '#DivineTiming'],
    },
    {
      content: '3 bước để thanh tẩy năng lượng tiêu cực sau một ngày dài 🛁\n\nMột ngày làm việc, giao dịch căng thẳng, tiếp xúc với nhiều drama có thể làm trường năng lượng của bạn bị vẩn đục (low vibe). Đừng mang năng lượng đó lên giường ngủ!\n\n1. **Tắm muối:** Muối biển có khả năng trung hòa ion dương và tẩy trược khí rất tốt. Hãy tưởng tượng dòng nước cuốn trôi mọi mệt mỏi.\n2. **Sử dụng âm thanh:** Gõ chuông xoay hoặc nghe nhạc tần số 417Hz (xóa bỏ năng lượng tiêu cực) hoặc 528Hz (chữa lành) trong 10 phút.\n3. **Thanh tẩy đá:** Nếu bạn đeo vòng tay phong thủy cả ngày, hãy đặt chúng lên thanh thạch anh trắng hoặc rửa dưới vòi nước chảy để đá được \'nghỉ ngơi\' và sạc lại năng lượng.\n\nGiữ mình sạch sẽ về mặt năng lượng là bước đầu tiên để thu hút vận may đấy các bạn ạ!',
      hashtags: ['#EnergyCleansing', '#GemralTips', '#ThanhTay', '#GoodVibesOnly'],
    },
    {
      content: 'Nếu vũ trụ ban cho bạn 1 tỷ ngay bây giờ, cảm xúc đầu tiên của bạn là gì? 💸\n\nA. Vui sướng tột độ, hét lên sung sướng.\nB. Nhẹ nhõm vì trả hết nợ nần.\nC. Lo lắng không biết giữ tiền thế nào, sợ bị lừa.\nD. Nghi ngờ, chắc là mơ thôi.\n\nHãy comment thành thật nhé! Cảm xúc đầu tiên chính là chỉ báo chính xác nhất về mối quan hệ hiện tại giữa bạn và tiền bạc. Nếu là B, C hay D, chúng ta cần làm việc lại với tiềm thức về tâm thức thịnh vượng (Wealth Consciousness) đấy!',
      hashtags: ['#GemralQnA', '#MoneyMindset', '#TamThucThinhVuong'],
    },
    {
      content: '🌙 Affirmation trước khi ngủ - Tái lập trình tiềm thức 🌙\n\nKhoảng thời gian lơ mơ trước khi chìm vào giấc ngủ là lúc sóng não chuyển sang Theta - trạng thái vàng để cài đặt tiềm thức. Đừng lướt tin tức tiêu cực lúc này!\n\nHãy nhẩm thầm:\n\'Tôi biết ơn ngày hôm nay vì những bài học và giá trị. Tôi buông bỏ mọi lo âu. Trong khi tôi ngủ, tiền bạc và sự thịnh vượng vẫn đang tìm đường đến với tôi. Ngày mai sẽ là một ngày tuyệt vời hơn nữa.\'\n\nNgủ ngon nhé cả nhà Gemral, để tiềm thức làm việc cho bạn cả trong giấc mơ! 💤',
      hashtags: ['#NightRoutine', '#TiemThuc', '#GemralSleep', '#Affirmation'],
    },
    {
      content: 'Kỹ thuật 369 của Nikola Tesla - Bạn đã thử chưa? ⚡️\n\nThiên tài Nikola Tesla từng nói: \'Nếu bạn hiểu được sự tráng lệ của 3, 6 và 9, bạn sẽ có chìa khóa giải mã vũ trụ\'.\n\nPhương pháp Manifest 369 rất đơn giản nhưng cực mạnh để tập trung ý định:\n- Sáng: Viết mục tiêu của bạn 3 lần.\n- Trưa: Viết mục tiêu đó 6 lần.\n- Tối: Viết mục tiêu đó 9 lần.\n\nLưu ý: Khi viết, hãy giữ tâm trạng như thể điều đó đã hoàn thành. Đừng viết như một cái máy chép phạt. Hãy viết bằng sự rung động của trái tim.\n\nAi đã thử và có kết quả rồi, comment chia sẻ để \'nhả vía\' cho mọi người với nào! 👇',
      hashtags: ['#369Method', '#TeslaCode', '#LuatHapDan', '#GemralCommunity'],
    },
    {
      content: 'Đá năng lượng có thực sự giúp Manifest nhanh hơn? 🔮\n\nCâu trả lời là CÓ và KHÔNG.\n\nKHÔNG: Nếu bạn nghĩ mua viên đá về, vứt đó rồi ngồi chờ tiền rơi xuống đầu. Đá không làm thay bạn.\n\nCÓ: Nếu bạn hiểu rằng đá thạch anh (Quartz) có cấu trúc tinh thể giúp lưu trữ, khuếch đại và cân bằng năng lượng.\n- Khi bạn đặt một ý niệm (Intention) vào viên đá, nó đóng vai trò như một trạm phát sóng, liên tục nhắc nhở tiềm thức và khuếch đại tần số rung động của ý niệm đó ra vũ trụ.\n- Ví dụ: Dùng đá Thạch Anh Tóc Vàng (Rutilated Quartz) để khuếch đại ý niệm về sự quyết đoán và tài lộc trong kinh doanh.\n\nHãy coi đá như một người bạn đồng hành, một \'thiết bị neo giữ tần số\' (Frequency Anchor) giúp bạn không bị trượt khỏi đường ray của sự tích cực.',
      hashtags: ['#CrystalEnergy', '#GemralKnowledge', '#ManifestationTools', '#ThachAnh'],
    },
    {
      content: 'Tại sao người giàu lại càng giàu? (Góc nhìn năng lượng) 💰\n\nNgoài kiến thức và kỹ năng, người giàu sở hữu một thứ rất quan trọng: TRƯỜNG NĂNG LƯỢNG CỦA SỰ DƯ DẢ.\n\nHọ không bao giờ tập trung vào \'hóa đơn phải trả\', họ tập trung vào \'dòng tiền sẽ về\'.\nHọ không sợ \'mất tiền\', họ hào hứng với \'cơ hội sinh lời\'.\n\nKhi bạn tập trung vào nợ nần, sự thiếu thốn, bạn đang gửi order cho vũ trụ: \'Cho tôi thêm nợ nần\'.\n\nĐể thay đổi thực tại tài chính, hãy bắt đầu thay đổi cuộc hội thoại trong đầu bạn. Thay vì nói \'Đắt quá không mua nổi\', hãy nói \'Làm thế nào để tôi mua được nó?\'. Sự chuyển dịch nhỏ trong tư duy sẽ thay đổi toàn bộ tần số rung động của bạn.',
      hashtags: ['#WealthMindset', '#GemralSharing', '#TuDuyThinhVuong', '#LawOfAttraction'],
    },
    {
      content: 'Biết ơn cả những nghịch cảnh - Level cao nhất của luật hấp dẫn 🙏\n\nDễ dàng để biết ơn khi mọi thứ suôn sẻ. Nhưng biết ơn khi thị trường đỏ lửa, khi mất mát, khi thất bại... mới là đẳng cấp của một master.\n\nTại sao phải biết ơn nghịch cảnh?\nVì đó là bài học. Là dấu hiệu vũ trụ bảo bạn cần chấn chỉnh lại phương pháp, cần học hỏi thêm, hoặc đơn giản là đang bảo vệ bạn khỏi một rủi ro lớn hơn trong tương lai.\n\nKhi bạn biết ơn nghịch cảnh, bạn chuyển hóa năng lượng tiêu cực thành bài học tích cực. Bạn không còn là nạn nhân, bạn là người làm chủ. Và người làm chủ thì luôn thu hút sự thịnh vượng quay trở lại.\n\n\'Cảm ơn vì bài học này, tôi đã sẵn sàng cho chương tiếp theo tốt đẹp hơn.\'',
      hashtags: ['#GratitudePractice', '#HighVibration', '#GemralMastery', '#ChuyenHoaTamThuc'],
    },
    {
      content: '🔔 Reminder: Bạn là trung bình cộng của 5 người bạn tiếp xúc nhiều nhất.\n\nNếu xung quanh bạn toàn là những người than vãn, tiêu cực, bàn lùi... thì dù bạn có cố gắng manifest đến đâu, trường năng lượng của bạn cũng bị kéo xuống.\n\nHãy mạnh dạn thanh lọc các mối quan hệ. Tìm đến những cộng đồng tích cực (như Gemral nè 😉), follow những người có tư duy thịnh vượng, đọc sách của những bậc thầy.\n\nBảo vệ trường năng lượng của mình cũng quan trọng như bảo vệ tài sản vậy.',
      hashtags: ['#MoiTruongTichCuc', '#GemralCommunity', '#TuDuyDung', '#BaoVeNangLuong'],
    },
    {
      content: 'Bí mật của \'Scripting\' (Viết kịch bản) 📝\n\nĐừng chỉ viết: \'Tôi muốn có một chiếc xe mới\'.\nHãy viết: \'Tôi đang vô cùng hạnh phúc và biết ơn vì bây giờ tôi đang lái chiếc [Tên xe] màu trắng lướt trên đường ven biển. Gió thổi mát rượi, tay tôi cảm nhận sự chắc chắn của vô lăng, và tôi cảm thấy thật tự hào về thành quả này.\'\n\nScripting là viết nhật ký cho tương lai, nhưng ở thì hiện tại.\nBí quyết là chi tiết + cảm xúc.\n\nDành 10 phút mỗi sáng để viết kịch bản cho cuộc đời mình. Bạn là đạo diễn, là biên kịch cho bộ phim đời mình. Đừng để người khác viết hộ!',
      hashtags: ['#Scripting', '#VietNhatKyTuongLai', '#GemralTips', '#SangTaoThucTai'],
    },
    {
      content: '✨ Khẳng định tích cực cho sự nghiệp thăng tiến ✨\n\n\'Tôi là một nam châm thu hút những cơ hội công việc tuyệt vời. Giá trị tôi trao đi ngày càng lớn, và thu nhập của tôi tăng trưởng tương xứng với giá trị đó. Tôi làm việc với niềm đam mê và sự an lạc.\'\n\nLưu lại và đọc mỗi khi bạn cảm thấy stress trong công việc hoặc đang tìm kiếm hướng đi mới nhé. Năng lượng của bạn sẽ quyết định vị thế của bạn.',
      hashtags: ['#CareerGrowth', '#Affirmation', '#GemralSuccess', '#PhatTrienBanThan'],
    },
    {
      content: 'Cắt lỗ cũng cần... lòng biết ơn? ✂️\n\nNghe vô lý nhưng lại rất thuyết phục.\nKhi phải cắt lỗ, thay vì cay cú, dằn vặt (tần số thấp), hãy thử nói: \'Cảm ơn thị trường đã cho tôi bài học về quản lý rủi ro. Số tiền này là học phí để tôi trưởng thành hơn. Tôi chấp nhận và buông bỏ để đón nhận cơ hội mới.\'\n\nViệc này giúp bạn không bị kẹt lại trong năng lượng của sự mất mát (Loss). Nó giúp tâm trí bạn trong sáng trở lại (Reset) để sẵn sàng cho lệnh thắng tiếp theo.\n\nĐừng để một lệnh thua ám ảnh cả hành trình đầu tư của bạn.',
      hashtags: ['#TradingMindset', '#CatLo', '#GemralTrading', '#QuanTriCamXuc'],
    },
    {
      content: 'Dọn dẹp nhà cửa = Dọn đường cho tài lộc 🧹\n\nTrong Phong Thủy và Luật Hấp Dẫn, sự bừa bộn (clutter) là biểu hiện của năng lượng tắc nghẽn. Một không gian sống lộn xộn sẽ tạo ra một tâm trí rối bời.\n\nBạn muốn thu hút những điều mới mẻ? Hãy dọn dẹp những cái cũ kỹ, hỏng hóc. Hãy để dòng khí (năng lượng) được lưu thông trong ngôi nhà bạn.\n\nCuối tuần này, hãy thử tổng vệ sinh, xông chút trầm hương, sắp xếp lại góc làm việc/trading. Bạn sẽ thấy đầu óc sáng suốt hơn hẳn và những ý tưởng kiếm tiền tự nhiên sẽ đến. Tin mình đi!',
      hashtags: ['#PhongThuyDoiSong', '#DonDepTamTri', '#GemralLifestyle', '#EnergyFlow'],
    },
    {
      content: 'Vũ trụ luôn nói \'CÓ\' với bạn.\n\nBạn nói: \'Cuộc sống này thật khó khăn\'. Vũ trụ nói: \'Có, đúng là như vậy\' -> Và Ngài cho bạn thêm khó khăn.\nBạn nói: \'Tôi thật may mắn và được yêu thương\'. Vũ trụ nói: \'Có, đúng là như vậy\' -> Và Ngài cho bạn thêm may mắn.\n\nVũ trụ không phán xét, Vũ trụ chỉ xác nhận và nhân rộng niềm tin của bạn.\n\nVậy hôm nay, bạn sẽ chọn nói gì với Vũ trụ? Hãy cẩn trọng với lời nói của mình, vì đó là mệnh lệnh bạn gửi đi đấy!',
      hashtags: ['#UniverseSaysYes', '#SucManhNgonTu', '#GemralInspiration', '#ChonLocSuyNghi'],
    },
    {
      content: 'Tại sao dân kinh doanh hay đặt \'Kim Linh Thạch\' trên bàn làm việc? 💰\n\nTrong giới năng lượng, Thạch Anh Vàng (Citrine) được mệnh danh là \'Viên đá của Thương gia\'. Nhưng không phải cứ mua về để đó là giàu. Bí mật nằm ở sự cộng hưởng tần số.\n\nKhi bạn đang stress vì doanh số, tần số của bạn là \'thiếu thốn\'. Lúc này, cấu trúc tinh thể của **Kim Linh Thạch** (dạng cụm) sẽ đóng vai trò như một trạm phát sóng, giúp khuếch đại ý niệm về sự thịnh vượng và phá vỡ các block năng lượng trì trệ.\n\nTip thực hành: Mỗi sáng trước khi check mail hay xem chart, hãy đặt tay lên cụm **Kim Linh Thạch**, nhắm mắt và cảm nhận ánh sáng vàng kim bao phủ lấy bạn. Khẳng định: \'Tôi là nam châm hút tiền\'. Đây là cách bạn \'tune\' (điều chỉnh) lại đài phát của mình trước khi bắt đầu ngày mới.',
      hashtags: ['#KimLinhThach', '#ThachAnhVang', '#GemralWealth', '#BusinessFengShui'],
    },
    {
      content: 'Trader thành công không \'săn\' tiền, họ \'hút\' tiền.\n\nNghe có vẻ lý thuyết, nhưng hãy ngẫm lại xem. Khi bạn hừng hực khí thế lao vào market với tâm thế \'phải gỡ lệnh thua hôm qua\', bạn thường... thua tiếp. Vì sao? Vì bạn đang phát ra tần số của sự KHÔNG CHẤP NHẬN thực tại và NÔN NÓNG.\n\nLuật hấp dẫn trong trading vận hành tốt nhất khi bạn ở trạng thái \'Flow\' (Dòng chảy). Bạn vào lệnh vì hệ thống báo tín hiệu, không phải vì bạn cần tiền trả nợ.\n\nHãy học cách tách biệt cảm xúc khỏi ví tiền. Khi bạn không quá quan trọng kết quả của một lệnh đơn lẻ, bạn lại thường thắng lớn. Nghịch lý, nhưng là chân lý.',
      hashtags: ['#TradingPsychology', '#FlowState', '#GemralTrading', '#TamLyGiaoDich'],
    },
    {
      content: 'Cảm thấy \'nặng đầu\', khó tập trung? Bạn cần một \'cột thu lôi\' năng lượng. ⚡️\n\nLàm việc nhiều với máy tính, điện thoại, hay suy nghĩ quá nhiều (overthinking) sẽ tích tụ điện từ trường xấu và năng lượng trì trệ (Smog) quanh vùng đầu.\n\nGiải pháp của mình là sử dụng **Lôi Phong Thạch** (trụ thạch anh khói). Dòng đá này cực mạnh trong việc \'grounding\' - nối đất và tiêu trừ tiêu cực.\n\nCách dùng: Khi thấy căng thẳng, hãy cầm trụ **Lôi Phong Thạch** hướng mũi nhọn ra ngoài cơ thể, hình dung mọi khói đen (stress) trong đầu đang bị hút vào đá và tống khứ ra ngoài vũ trụ. Chỉ 5 phút thôi, bạn sẽ thấy đầu óc nhẹ bẫng như vừa được reset.',
      hashtags: ['#LoiPhongThach', '#ThachAnhKhoi', '#GiamStress', '#GemralHealing'],
    },
    {
      content: 'Muốn thu hút \'Soulmate\', trước tiên phải yêu lấy chính mình ❤️\n\nNhiều bạn nữ hỏi mình cách manifest người yêu. Mình luôn hỏi lại: \'Bạn có đang yêu chính bản thân mình không?\'. Bạn không thể trao đi thứ bạn không có.\n\nĐể kích hoạt tần số rung động của tình yêu (Love Frequency), mình thường khuyên các bạn sử dụng **Duyên Khởi Thạch** (trụ thạch anh hồng). Màu hồng dịu nhẹ của nó tác động trực tiếp vào Luân xa Tim (Anahata).\n\nRitual nhỏ: Mỗi tối, thắp một ngọn nến, nhìn vào trụ **Duyên Khởi Thạch** và nói với bản thân 3 điều bạn trân trọng ở chính mình. Khi bạn tự thấy mình đáng giá, cả thế giới (và người ấy) sẽ thấy bạn như một viên ngọc quý.',
      hashtags: ['#DuyenKhoiThach', '#LoveMagnet', '#SelfLove', '#GemralRelationships'],
    },
    {
      content: '✨ Khẳng định cho sự tự tin và quyền lực ✨\n\n\'Tôi tin tưởng vào trực giác và quyết định của mình. Tôi có đủ bản lĩnh để vượt qua mọi thách thức. Mỗi thử thách là một nấc thang đưa tôi lên tầm cao mới.\'\n\nLưu lại và đọc to 3 lần trước khi bước vào cuộc họp quan trọng hoặc trước khi đưa ra quyết định đầu tư nhé các Gemral-er!',
      hashtags: ['#Affirmation', '#PowerMindset', '#GemralMotivation', '#TuTin'],
    },
    {
      content: 'Bí mật của **Set Ẩn Long Thạch Limited Edition** trong việc kiến tạo gia sản.\n\nKhông phải ngẫu nhiên mà giới chủ doanh nghiệp hay các nhà đầu tư lớn lại săn lùng **Set Ẩn Long Thạch**. Đây là sự kết hợp hoàn hảo của Ngũ hành, tạo ra một trường năng lượng bảo hộ và chiêu tài cực mạnh.\n\nKhi bạn đặt set này ở cung Tài lộc (Đông Nam) của ngôi nhà hoặc văn phòng, bạn đang thiết lập một \'trận đồ\' năng lượng. Nó không chỉ giúp thu hút vượng khí (Luật Hấp Dẫn) mà còn giúp giữ tiền (tránh thất thoát).\n\nHãy nhớ: Kiếm tiền dựa vào năng lực, nhưng giữ tiền và nhân tiền đôi khi cần thêm chút \'trợ lực\' từ năng lượng gốc của Trái Đất.',
      hashtags: ['#SetAnLongThach', '#PhongThuyDoanhNhan', '#GiuTien', '#GemralExclusive'],
    },
    {
      content: 'Vision Board (Bảng tầm nhìn) - Đừng chỉ dán ảnh, hãy dán cả cảm xúc!\n\nBạn cắt ảnh chiếc xe, ngôi nhà dán lên bảng. Tốt. Nhưng chưa đủ.\nBí quyết để Vision Board hoạt động là khi nhìn vào nó, bạn phải thấy \'nổi da gà\'.\n\nHãy dán thêm vào đó những từ khóa (keywords) chạm đến cảm xúc của bạn. Ví dụ: \'Tự do\', \'An yên\', \'Đẳng cấp\'.\n\nvà đừng quên đặt một viên **Dạ Minh Châu** (Quả cầu thạch anh tím) gần Vision Board của bạn. Năng lượng của thạch anh tím giúp khai mở trực giác và kết nối ý nguyện của bạn với vũ trụ nhanh hơn gấp nhiều lần.',
      hashtags: ['#VisionBoard', '#DaMinhChau', '#ThachAnhTim', '#GemralTips'],
    },
    {
      content: 'Đừng \'xin\', hãy \'ra lệnh\' (nhưng với sự khiêm cung).\n\nKhi bạn cầu nguyện \'Xin cho con trúng số\', bạn đang ở vị thế của người yếu thế, thiếu thốn. Vũ trụ nhận được tín hiệu \'Thiếu\'.\n\nThay vào đó, hãy thiết lập ý định (Intention Setting): \'Tôi sẵn sàng đón nhận sự giàu có. Tôi ra lệnh cho tiềm thức tìm kiếm mọi cơ hội để gia tăng tài sản của tôi\'.\n\nQuyền năng nằm trong tay bạn. Bạn là người sáng tạo ra thực tại của mình (Co-creator). Hãy đứng thẳng lưng lên và đón nhận những gì thuộc về bạn.',
      hashtags: ['#IntentionSetting', '#MindsetNguoiGiau', '#GemralSpirituality', '#CoCreator'],
    },
    {
      content: 'Tại sao **Hoàng Kim Trụ** (Trụ thạch anh vàng) lại là vật bất ly thân của dân tài chính?\n\nHình dáng của trụ đá: Đáy rộng vững chãi, đỉnh nhọn hướng thẳng lên trời. Đây là cấu trúc anten thu - phát năng lượng mạnh nhất.\n\nVới dân tài chính/crypto, sự biến động của thị trường dễ làm tâm trí dao động. **Hoàng Kim Trụ** giúp neo giữ ý chí (Willpower) ở vùng Luân xa Búi Mặt Trời (Solar Plexus). Nó giúp bạn giữ cái đầu lạnh và sự quyết đoán.\n\nĐặt một trụ trên bàn làm việc, hướng mũi nhọn lên trên, bạn sẽ thấy sự tập trung và độ nhạy bén với các con số được cải thiện rõ rệt.',
      hashtags: ['#HoangKimTru', '#ThachAnhVang', '#SolarPlexus', '#GemralFinance'],
    },
    {
      content: 'Ngày 5 - Thử thách Biết ơn: Biết ơn Tiền bạc 💸\n\nDù trong ví bạn đang có bao nhiêu tiền, hãy lấy một tờ tiền ra, cầm nó trên tay và nói \'Cảm ơn\'.\n\nCảm ơn vì số tiền này giúp tôi mua thức ăn. Cảm ơn vì nó giúp tôi kết nối internet để đọc bài viết này. Đừng ghét bỏ tiền chỉ vì bạn chưa có nhiều. Nếu bạn ghét tiền, tiền sẽ không đến với bạn.\n\nHãy đối xử với tiền như một người bạn tri kỷ. Năng lượng của sự trân trọng sẽ mở rộng dòng chảy tài chính của bạn.',
      hashtags: ['#21NgayBietOn', '#MoneyEnergy', '#GemralChallenge', '#LoveMoney'],
    },
    {
      content: 'Kết nối tâm linh và trực giác với **Tinh Hà Thạch** (Cụm thạch anh tím).\n\nTrong trading hay đầu tư, đôi khi \'linh tính\' mách bảo bạn chốt lời đúng đỉnh, hoặc tránh xa một dự án scam. Đó không phải may mắn, đó là Trực giác (Intuition) hoạt động.\n\nĐể mài sắc trực giác, hãy thiền định cùng **Tinh Hà Thạch**. Thạch anh tím là viên đá của Luân xa Con mắt thứ 3 (Third Eye). Các tinh thể mọc tua tủa trong cụm đá này sẽ giúp lọc bỏ nhiễu loạn, giúp bạn nhìn thấu bản chất vấn đề.\n\nĐừng chỉ dùng não trái (logic), hãy để não phải (trực giác) dẫn đường cho bạn trong những thời khắc quyết định.',
      hashtags: ['#TinhHaThach', '#TrucGiac', '#DauTuThongMinh', '#GemralWisdom'],
    },
    {
      content: 'Bạn đang \'chạy trốn\' hay \'hướng tới\'? 🏃‍♂️\n\nBạn muốn giàu vì SỢ nghèo, hay vì YÊU sự tự do?\nBạn muốn có người yêu vì SỢ cô đơn, hay vì MUỐN sẻ chia hạnh phúc?\n\nĐộng lực (Motivation) đằng sau mong muốn của bạn quyết định tần số bạn phát ra. Nếu động lực là Nỗi Sợ, bạn sẽ thu hút thêm những thứ đáng sợ. Nếu động lực là Tình Yêu/Niềm Vui, bạn sẽ thu hút sự đủ đầy.\n\nHãy check lại \'động cơ\' của mình ngay bây giờ nhé!',
      hashtags: ['#GemralQnA', '#SelfReflection', '#LuatHapDan', '#DongLucDung'],
    },
    {
      content: 'Gột rửa hào quang (Aura) với **Thiên Băng Trụ** (Trụ thạch anh trắng).\n\nThạch anh trắng là \'Master Healer\' - bậc thầy chữa lành. Nếu bạn cảm thấy mệt mỏi, bế tắc, hay xui xẻo liên miên, có thể hào quang của bạn đang bị \'thủng\' hoặc bám bẩn.\n\nSử dụng **Thiên Băng Trụ** để rà quanh cơ thể (cách da khoảng 5-10cm) từ đầu xuống chân. Hãy hình dung ánh sáng trắng tinh khiết từ viên đá đang vá lại những lỗ hổng năng lượng và đốt cháy những trược khí.\n\nMột cơ thể năng lượng sạch sẽ là nền tảng để Luật Hấp Dẫn vận hành trơn tru.',
      hashtags: ['#ThienBangTru', '#ThachAnhTrang', '#AuraCleansing', '#GemralHealing'],
    },
    {
      content: 'Nghịch lý của sự buông bỏ: Càng giữ chặt càng mất.\n\nBạn có bao giờ để ý, khi bạn quá khao khát một người, họ thường chạy trốn bạn? Khi bạn quá áp lực phải kiếm tiền, tiền lại khan hiếm?\n\nNăng lượng của sự \'cần thiết\' (Neediness) là năng lượng đẩy. Vũ trụ thích sự tự tin và thảnh thơi.\n\nHãy thực hành: Đặt mục tiêu -> Làm hết sức -> Rồi buông tay ra. Hãy tin rằng nếu nó dành cho bạn, nó sẽ không đi đâu cả. Nếu nó không dành cho bạn, vũ trụ đang dọn chỗ cho thứ tốt hơn.\n\nThư giãn đi, những điều tuyệt vời nhất thường đến khi ta ít mong chờ nhất.',
      hashtags: ['#NghichLyCuocSong', '#BuongBo', '#GemralMindset', '#TrustTheProcess'],
    },
    {
      content: 'Cách sử dụng **Như Ý Lệnh - Cây Tình Ái** để hàn gắn mối quan hệ.\n\nKhông khí gia đình căng thẳng? Vợ chồng hay khắc khẩu? Đó là dấu hiệu của sự mất cân bằng năng lượng trong không gian sống.\n\n**Như Ý Lệnh** với năng lượng dịu dàng của Thạch anh hồng sẽ giúp làm mềm hóa bầu không khí. Đặt cây này ở phòng ngủ hoặc phòng khách - nơi mọi người hay tụ tập. Năng lượng của đá sẽ âm thầm xoa dịu những cái tôi nóng nảy, khơi gợi lòng trắc ẩn và sự thấu hiểu.\n\nNhà hòa thuận thì vạn sự mới hưng. Đừng chỉ lo kiếm tiền mà quên mất gốc rễ là gia đình, các bạn nhé.',
      hashtags: ['#NhuYLenh', '#ThachAnhHong', '#GiaDaoBinhAn', '#GemralFengShui'],
    },
    {
      content: 'Phương pháp \'Gối đầu giường\' (Pillow Method) 🛌\n\nĐây là cách manifest siêu đơn giản cho những người lười:\n1. Viết mong muốn của bạn ra một mảnh giấy nhỏ (dùng thì hiện tại: \'Tôi hạnh phúc vì...\').\n2. Đặt mảnh giấy đó dưới gối ngủ.\n3. Trước khi ngủ, hãy chạm vào gối và nghĩ về điều đó một chút rồi chìm vào giấc ngủ.\n\nViệc này giúp ý niệm của bạn thấm sâu vào tiềm thức suốt 8 tiếng bạn ngủ. Sáng hôm sau, hãy quên nó đi và để vũ trụ làm việc. Thử xem, biết đâu bất ngờ sẽ đến vào ngày mai?',
      hashtags: ['#PillowMethod', '#ManifestationHack', '#GemralTips', '#TiemThuc'],
    },
    {
      content: 'Combo \'Quyền Lực\' cho sự nghiệp: **Set Vương Chi Thạch V.I.P 3**.\n\nNếu bạn đang là quản lý, chủ doanh nghiệp hoặc đang muốn thăng tiến lên vị trí cao hơn, bạn cần một trường năng lượng đủ \'dày\' và \'mạnh\' để áp chế tiểu nhân và thu phục nhân tâm.\n\n**Set Vương Chi Thạch** không chỉ là đá trang trí. Sự kết hợp của các trụ đá lớn tạo ra thế \'Tựa Sơn\' vững chãi. Nó giúp gia tăng uy lực trong lời nói và sự sáng suốt trong chiến lược.\n\nHãy nhớ: Vị trí càng cao, gió càng lớn. Bạn cần một điểm tựa năng lượng vững chắc để không bị lung lay.',
      hashtags: ['#SetVuongChiThach', '#CareerSuccess', '#LanhDao', '#GemralVIP'],
    },
    {
      content: '✨ Khẳng định cho tình yêu thương bản thân ✨\n\n\'Tôi trân trọng từng tế bào trong cơ thể mình. Tôi tha thứ cho những lỗi lầm quá khứ và mở lòng đón nhận phiên bản tốt hơn của chính tôi. Tôi xứng đáng được hạnh phúc.\'\n\nKhi đọc câu này, hãy đặt tay lên tim và cảm nhận nhịp đập của sự sống. Bạn là một phép màu, đừng bao giờ quên điều đó.',
      hashtags: ['#SelfLoveJourney', '#Affirmation', '#GemralSoul', '#ChuaLanh'],
    },
    {
      content: 'Đeo **Vòng tay Hiên Viên** (Thạch anh hồng charm vô cực) có giúp có người yêu không? 🌸\n\nNhiều bạn feedback cho mình là có. Nhưng cơ chế không phải là \'bùa yêu\'.\n\nKhi bạn đeo **Hiên Viên**, năng lượng của thạch anh hồng giúp bạn trở nên nhu hòa hơn, ánh mắt bạn dịu dàng hơn, và bạn bớt phán xét người khác. Chính sự thay đổi trong khí chất đó (Aura) làm bạn trở nên quyến rũ và thu hút hơn trong mắt người khác giới.\n\nĐá giúp bạn \'nâng cấp\' bản thân, và phiên bản tốt đẹp đó của bạn mới là thứ hút lấy tình yêu.',
      hashtags: ['#HienVien', '#ThachAnhHong', '#ThuHutTinhYeu', '#GemralJewelry'],
    },
    {
      content: 'Mọi thứ xảy ra đều là vì bạn (For you), không phải xảy đến với bạn (To you).\n\nKhi gặp chuyện không như ý, thay vì than trách \'Tại sao lại là tôi?\', hãy hỏi \'Vũ trụ đang muốn dạy tôi điều gì qua việc này?\'.\n\nSự chuyển dịch góc nhìn (Shift perspective) này sẽ biến bạn từ nạn nhân thành người học hỏi. Và khi bạn học xong bài học, nghịch cảnh sẽ tự tan biến. Đó là quy luật.',
      hashtags: ['#LifeLessons', '#GocNhin', '#GemralInspiration', '#PhatTrienTamThuc'],
    },
    {
      content: 'Ngũ hành nạp vận - Bí mật của **Set Ngũ Kim Thạch** 🌟\n\nTrong vũ trụ, vạn vật đều vận hành theo quy luật Kim - Mộc - Thủy - Hỏa - Thổ. Khi cuộc sống hay việc kinh doanh của bạn bị \'tắc\', thường là do sự mất cân bằng của một trong các hành này.\n\n**Set Ngũ Kim Thạch** là giải pháp \'cân bằng năng lượng\' toàn diện nhất mà mình từng trải nghiệm. Với sự hiện diện của đủ 5 loại đá tương ứng 5 hành, set đá này giúp điều hòa trường khí trong không gian sống.\n\nKhi năng lượng cân bằng, tâm trí bạn sẽ tự nhiên thông suốt, các cơ hội (Duyên) sẽ tự tìm đến. Đây là bước đệm vững chắc nhất trước khi bạn thực hiện bất kỳ kỹ thuật Manifestation cao cấp nào.',
      hashtags: ['#SetNguKimThach', '#CanBangNangLuong', '#GemralFengShui', '#NguHanh'],
    },
    {
      content: 'Quy tắc 17 giây của Abraham Hicks - Bạn đã biết chưa? ⏱️\n\nTheo bà Abraham Hicks - bậc thầy về Luật Hấp Dẫn: Chỉ cần bạn giữ một suy nghĩ thuần khiết (không bị nỗi sợ xen vào) trong 17 giây, Luật Hấp Dẫn sẽ bắt đầu kích hoạt. Và nếu bạn giữ được nó trong 68 giây (4 lần 17 giây), sự biểu hiện (manifestation) sẽ bắt đầu diễn ra trong thế giới vật chất.\n\nNghe dễ không? Nhưng thử đi rồi biết. Để giữ 68 giây chỉ nghĩ về sự giàu có mà không bị ý nghĩ \'nhưng mình đang nợ\' chen vào là cực khó.\n\nLuyện tập nhé: Mỗi sáng, hãy dành đúng 68 giây để \'tắm\' mình trong cảm giác của sự thành công. Đừng lo về \'làm thế nào\', chỉ tập trung vào \'cảm giác\'.',
      hashtags: ['#17SecondsRule', '#AbrahamHicks', '#GemralTraining', '#TapTrungTuTuong'],
    },
    {
      content: 'Làm sao để trade \'xanh\' khi xung quanh toàn năng lượng \'đỏ\'? 🛡️\n\nMôi trường công sở hay các hội nhóm trading thường đầy rẫy sự than vãn, đố kỵ và tiêu cực (Toxic energy). Nếu bạn là người nhạy cảm (Empath), bạn rất dễ bị \'lây\' những năng lượng này, dẫn đến quyết định sai lầm.\n\nVật hộ thân mình luôn đeo là **Vòng tay Huyền Ảnh** (Đá Hematite charm Evil Eye). Hematite là bậc thầy về hộ thân (Protection), nó tạo ra một lớp khiên phản hồi lại năng lượng xấu. Còn charm Evil Eye giúp bạn tránh được những ánh mắt ghen tị, tiểu nhân.\n\nGiữ năng lượng của mình sạch sẽ là cách tốt nhất để bảo vệ túi tiền của bạn.',
      hashtags: ['#HuyenAnh', '#Hematite', '#EvilEye', '#GemralProtection', '#BaoVeNangLuong'],
    },
    {
      content: 'Bạn có hay nhìn thấy các con số lặp lại như 11:11, 222, 888? 🔢\n\nĐừng bỏ qua nhé, đó là Vũ trụ đang gửi tin nhắn (Sign) cho bạn đấy!\n- 111: Hãy cẩn trọng với suy nghĩ của bạn, cánh cổng năng lượng đang mở, bạn nghĩ gì sẽ thành hiện thực ngay.\n- 888: Dấu hiệu của sự thịnh vượng và dòng tiền đang chảy về (Dân Gemral chắc thích số này nhất 😉).\n\nKhi thấy những con số này, hãy dừng lại 1 giây, mỉm cười và nói: \'Tôi đã nhận được tín hiệu. Tôi sẵn sàng đón nhận\'. Đó là cách bạn tương tác (Interact) với Vũ trụ.',
      hashtags: ['#AngelNumbers', '#SignsFromUniverse', '#GemralSigns', '#ThongDiepVuTru'],
    },
    {
      content: 'Xóa tan \'Sương mù não\' (Brain Fog) với **Thiên Băng Trụ** ❄️\n\nCó những ngày ngồi trước màn hình, nhìn chart mà đầu óc trống rỗng, không biết nên Buy hay Sell, cảm giác lờ đờ thiếu minh mẫn. Đó là lúc hào quang trí tuệ của bạn bị tắc nghẽn.\n\n**Thiên Băng Trụ** (Trụ thạch anh trắng) với tần số rung động cực cao và tinh khiết sẽ giúp bạn \'khai thông\' Luân xa Vương Miện (Crown Chakra).\n\nChỉ cần đặt tay lên trụ đá, hít thở sâu và hình dung một luồng ánh sáng trắng đi từ đỉnh đầu xuống, rửa trôi mọi sự mơ hồ. Sự sáng suốt (Clarity) là vũ khí tối thượng của một nhà đầu tư.',
      hashtags: ['#ThienBangTru', '#ThachAnhTrang', '#MinhMan', '#GemralWisdom'],
    },
    {
      content: 'Tha thứ cho bản thân - Bước quan trọng để khơi thông dòng chảy tài chính 🙏\n\nNhiều bạn nhắn tin cho mình, dằn vặt vì lỡ làm mất tiền, lỡ đu đỉnh, lỡ tin nhầm người... Sự dằn vặt đó chính là tảng đá chặn đứng dòng tiền mới đến với bạn.\n\nHãy thực hành bài tập này: Đặt tay lên tim và nói: \'Tôi tha thứ cho chính mình vì những quyết định trong quá khứ. Lúc đó tôi đã làm tốt nhất với những gì tôi biết. Bây giờ tôi khôn ngoan hơn, tôi xứng đáng với những cơ hội mới\'.\n\nKhi bạn buông bỏ gánh nặng quá khứ, đôi tay bạn mới rảnh để đón nhận quà tặng của hiện tại.',
      hashtags: ['#SelfForgiveness', '#MoneyBlock', '#GemralHealing', '#ThaThu'],
    },
    {
      content: 'Dịu dàng hóa mọi mối quan hệ với **Vòng tay Hồng Ngự** 🌸\n\nTrong trading hay kinh doanh, đôi khi chúng ta trở nên quá cứng nhắc, lý trí và khô khan. Điều này vô tình làm tổn thương các mối quan hệ thân thiết.\n\n**Vòng tay Hồng Ngự** (Thạch anh hồng charm Cá Koi) mang năng lượng của nước và tình yêu. Thạch anh hồng giúp mở cửa trái tim, còn Cá Koi tượng trưng cho sự kiên trì và may mắn trong tình cảm.\n\nĐeo chiếc vòng này không chỉ để đẹp, mà là lời nhắc nhở: Dù bên ngoài có sóng gió thế nào, hãy luôn giữ một trái tim mềm mại để yêu thương. Vì suy cho cùng, chúng ta kiếm tiền để hạnh phúc bên người thân mà, đúng không?',
      hashtags: ['#HongNgu', '#ThachAnhHong', '#CaKoi', '#GemralLove', '#CanBangCuocSong'],
    },
    {
      content: 'Quy luật Cho và Nhận (Giving & Receiving) trong Manifestation 🎁\n\nNhiều người chỉ chăm chăm học cách \'Nhận\' (thu hút tiền, tình...) mà quên mất vế \'Cho\'. Dòng chảy năng lượng phải có ra có vào.\n\nBạn muốn giàu có? Hãy hào phóng. Không cần phải đợi giàu mới cho. Hãy hào phóng lời khen, hào phóng nụ cười, hào phóng kiến thức (như cách tụi mình chia sẻ trên Gemral nè).\n\nKhi bạn cho đi với tâm thế dư dả (không toan tính), Vũ trụ sẽ ghi nhận: \'Người này có nhiều quá, nên mới cho đi được\'. Và thế là Vũ trụ lại gửi thêm cho bạn để bạn tiếp tục cho. Đó là bí mật của sự thịnh vượng vĩnh cửu.',
      hashtags: ['#GivingAndReceiving', '#LuatNhanQua', '#GemralSharing', '#TuDuyGieoHat'],
    },
    {
      content: 'Kích hoạt năng lượng \'Rồng\' cho sự bứt phá: **Set Giáng Long Thạch** 🐉\n\nNếu bạn đang ấp ủ một dự án lớn, một cú pivot (chuyển mình) trong sự nghiệp, bạn cần một nguồn năng lượng mạnh mẽ hơn bình thường. Năng lượng của sự kiến tạo và bứt phá.\n\n**Set Giáng Long Thạch** là sự kết hợp của Thạch anh vàng (quyền lực, tài lộc) và Thạch anh xanh (cơ hội, sự phát triển). Nó tạo ra thế \'Long giáng\' - mang vận khí từ trên cao xuống hỗ trợ cho gia chủ.\n\nĐây là set đá dành cho những Leader, những người dám nghĩ lớn và cần một nguồn năng lượng tàn phá những rào cản cũ kỹ.',
      hashtags: ['#SetGiangLongThach', '#Breakthrough', '#Leadership', '#GemralPower'],
    },
    {
      content: '🌙 Affirmation trước khi ngủ: Cài đặt sự giàu có 🌙\n\n\'Tôi biết ơn vì một ngày đã qua. Tôi chìm vào giấc ngủ với sự bình an trọn vẹn. Trong khi tôi ngủ, tiền của tôi vẫn đang sinh sôi nảy nở. Tôi thức dậy vào ngày mai với những ý tưởng triệu đô và năng lượng tràn đầy.\'\n\nĐọc thầm câu này, thả lỏng toàn thân và chìm vào giấc ngủ. Hãy để tiềm thức làm việc thay bạn trong 8 tiếng nghỉ ngơi.',
      hashtags: ['#SleepAffirmation', '#TiemThuc', '#GemralNight', '#PassiveIncomeMindset'],
    },
    {
      content: 'Ngủ ngon để... giàu nhanh hơn cùng **Dạ Tinh Thạch** 😴\n\nNghe lạ ha? Nhưng sự thật là giấc ngủ chất lượng quyết định độ minh mẫn của bạn vào sáng hôm sau - thời điểm vàng để ra quyết định kiếm tiền.\n\n**Dạ Tinh Thạch** (Cụm thạch anh tím) là \'liều thuốc ngủ\' tự nhiên của vũ trụ. Đặt một cụm ở đầu giường, năng lượng tần số cao của thạch anh tím sẽ giúp làm dịu sóng não, đưa bạn vào giấc ngủ sâu (Deep Sleep) nhanh chóng, đồng thời bảo vệ bạn khỏi những giấc mơ hỗn loạn.\n\nThân tâm an lạc thì trí tuệ mới sinh khởi. Đừng coi thường giấc ngủ nhé các Gemral-er!',
      hashtags: ['#DaTinhThach', '#ThachAnhTim', '#GiacNguVang', '#GemralHealth'],
    },
    {
      content: 'Nghệ thuật của sự \'Thờ ơ\' (Detachment) trong Luật Hấp Dẫn.\n\nKhi bạn đặt một lệnh trade, hay gửi đi một mong muốn, rồi bạn... quên nó đi, đi chơi, đi tập gym. Tự nhiên lúc quay lại: Lệnh chốt lời, điều ước thành hiện thực.\n\nTại sao? Vì khi bạn \'thờ ơ\', bạn cắt đứt sợi dây của sự KHÁNG CỰ (Resistance). Bạn không còn lo lắng, không còn kiểm soát. Bạn để cho dòng chảy năng lượng được tự do vận hành.\n\nThờ ơ không phải là vô tâm, mà là sự TIN TƯỞNG TUYỆT ĐỐI rằng: \'Việc đã được sắp xếp, mình cứ vui sống thôi\'.',
      hashtags: ['#Detachment', '#LawOfAttraction', '#GemralMindset', '#BuongBoDeNhan'],
    },
    {
      content: 'Giữ cái đầu lạnh như nước với **Thanh Hải Ngọc - Cây Tái Sinh** 🌊\n\nTrong đầu tư, cảm xúc là kẻ thù. Nóng giận, sợ hãi, tham lam đều dẫn đến \'cháy tài khoản\'. Bạn cần năng lượng của Nước - mềm mại, uyển chuyển nhưng kiên định.\n\n**Thanh Hải Ngọc** (Cây tài lộc Aquamarine/Thạch anh xanh) mang năng lượng của đại dương. Màu xanh mát dịu của nó giúp làm dịu hệ thần kinh giao cảm tức thì.\n\nKhi thị trường biến động mạnh, hãy nhìn vào **Thanh Hải Ngọc**, hít thở sâu. Hãy để tâm trí bạn tĩnh lặng như mặt hồ. Khi mặt hồ phẳng lặng, nó mới phản chiếu chính xác bầu trời (cơ hội).',
      hashtags: ['#ThanhHaiNgoc', '#Aquamarine', '#TamBatBien', '#GemralTrading'],
    },
    {
      content: 'Q: Jennie ơi, mình manifest mãi mà không thấy kết quả, có phải Luật Hấp Dẫn không linh nghiệm với mình?\n\nA: Không phải đâu. Luật Hấp Dẫn như trọng lực vậy, nó hoạt động với tất cả mọi người 24/7. Vấn đề là \'Thời điểm thiêng liêng\' (Divine Timing).\n\nCó thể phiên bản hiện tại của bạn chưa đủ \'sức chứa\' để nhận món quà đó. Vũ trụ đang trì hoãn để bạn có thời gian nâng cấp bản thân (về kiến thức, kỹ năng, tâm thức).\n\nHãy kiên nhẫn. Khi học trò sẵn sàng, người thầy sẽ xuất hiện. Khi bạn xứng đáng, tiền bạc sẽ ập đến. Bạn có tin vào quá trình này không?',
      hashtags: ['#GemralQnA', '#DivineTiming', '#KienNhan', '#PhatTrienBan Than'],
    },
    {
      content: 'Sự hoàn hảo của năng lượng: **Set Thập Bảo Thạch** ✨\n\nNếu bạn là người cầu toàn, muốn mọi khía cạnh cuộc sống (Tài chính - Tình cảm - Sức khỏe - Trí tuệ) đều được nâng cấp đồng bộ, thì **Set Thập Bảo Thạch** là lựa chọn tối ưu.\n\nĐây là sự tập hợp của 10 loại đá/trụ đá với các tần số rung động khác nhau, tạo nên một mạng lưới năng lượng hỗ trợ đa chiều. Nó giống như việc bạn có một đội ngũ chuyên gia, mỗi người lo một mảng cho cuộc đời bạn vậy.\n\nĐừng chọn lựa nếu bạn có thể có tất cả. Sự trọn vẹn là đích đến của tâm linh.',
      hashtags: ['#SetThapBaoThach', '#TronVen', '#GemralLuxury', '#AllInOne'],
    },
    {
      content: 'Dọn dẹp \'Rác số\' (Digital Clutter) - Bước thanh lọc thời đại mới 📱\n\nBạn dọn nhà sạch sẽ, nhưng điện thoại, laptop thì đầy rác: Hàng nghìn email chưa đọc, follow những trang tin tiêu cực, lưu trữ ảnh người yêu cũ...\n\nNhững thứ này chiếm dụng \'băng thông\' não bộ và năng lượng của bạn cực lớn. Mỗi lần nhìn thấy, tiềm thức lại bị kích hoạt những cảm xúc không tốt.\n\nCuối tuần này, hãy dành 1 tiếng để unfollow, delete, dọn dẹp máy móc. Bạn sẽ thấy không gian tâm trí rộng mở hơn hẳn để đón những ý tưởng (và dòng tiền) mới!',
      hashtags: ['#DigitalDetox', '#ThanhLoc', '#GemralLifestyle', '#NewEnergy'],
    },
    {
      content: 'Bình an giữa tâm bão với **Vòng tay Vũ Âm** 🕉️\n\nCuộc sống luôn có những biến cố bất ngờ. Làm sao để giữ được sự bình tĩnh (Grounding) khi mọi thứ đảo lộn?\n\n**Vòng tay Vũ Âm** kết hợp đá Hematite (năng lượng của Đất - vững chãi) và charm Thần Chú OM (âm thanh gốc của Vũ trụ - bình an). Nó giúp bạn kết nối lại với mặt đất, xả bớt năng lượng lo âu dư thừa.\n\nKhi đeo vòng này, hãy nhớ: Bạn là ngọn núi, bão tố chỉ là thời tiết. Núi thì không bao giờ bị gió thổi bay.',
      hashtags: ['#VuAm', '#Hematite', '#OmMantra', '#BinhAnNoiTam', '#GemralJewelry'],
    },
    {
      content: '3 cách nâng tần số rung động (Vibration) tức thì trong 5 phút 🚀\n\nBạn đang tụt mood? Thử ngay:\n1. **Nghe nhạc tần số cao:** Tìm từ khóa \'528Hz\' hoặc \'Music for wealth\' trên Youtube. Âm thanh đi thẳng vào tiềm thức.\n2. **Chạm vào thiên nhiên:** Đi chân trần trên cỏ, tưới cây, hoặc đơn giản là ngắm nhìn bầu trời xanh. Mẹ Thiên Nhiên luôn có tần số chữa lành.\n3. **Cầm đá thạch anh:** Lấy viên đá bạn yêu thích, nắm chặt trong tay, cảm nhận sự mát lạnh và ổn định của nó. Đá là \'cục pin\' năng lượng của Trái Đất mà.\n\nĐừng để mood thấp kéo dài quá lâu, nó sẽ block vận may của bạn đấy!',
      hashtags: ['#RaiseVibration', '#HighVibeHack', '#GemralTips', '#NangLuongTichCuc'],
    },
    {
      content: 'Combo \'Trí - Phú\' song toàn: **Set Mật Thiên Lệnh** 🗝️\n\nNgười có tiền mà thiếu trí thì dễ mất. Người có trí mà thiếu tiền thì khó thực hiện hoài bão.\n\n**Set Mật Thiên Lệnh** kết hợp Thạch anh tím (Trí tuệ, Tâm linh) và Thạch anh vàng (Tài lộc, Quyền lực). Đây là bộ đôi hoàn hảo cho những ai muốn đi con đường \'Doanh nhân tỉnh thức\'.\n\nSự giàu có bền vững phải đến từ sự sáng suốt. Hãy dùng Thạch anh tím để soi đường, và dùng Thạch anh vàng để trải thảm vàng trên con đường đó.',
      hashtags: ['#SetMatThienLenh', '#WisdomAndWealth', '#DoanhNhanTinhThuc', '#GemralExclusive'],
    },
    {
      content: 'Biến nguy thành cơ - Sức mạnh của sự chuyển hóa góc nhìn 🔄\n\nNăm ngoái, mình bị mất một hợp đồng lớn vào phút chót. Lúc đầu mình rất sốc và muốn đổ lỗi. Nhưng sau khi thiền và bình tâm lại, mình quyết định thay đổi câu chuyện: \'Vũ trụ chặn hợp đồng này lại vì có một cái khác tốt hơn đang đợi\'.\n\nThay vì ngồi tiếc nuối, mình dành thời gian đó để học thêm kỹ năng mới và nâng cấp quy trình làm việc. Và bạn đoán xem? 2 tháng sau, một đối tác mới xuất hiện, mang lại doanh thu gấp 3 lần hợp đồng cũ.\n\nLuật hấp dẫn không phải là cầu được ước thấy ngay lập tức, mà là tin tưởng vào sự sắp đặt tốt nhất. Khi một cánh cửa đóng lại, đừng đứng đó khóc, hãy đi tìm cánh cửa đang mở!',
      hashtags: ['#GemralStory', '#MindsetShift', '#TrustTheUniverse', '#CoHoiMoi'],
    },
    {
      content: 'Thanh lọc không gian giao dịch với **Cụm Thạch Anh Trắng** 💎\n\nBạn có biết, máy tính và các thiết bị điện tử phát ra sóng điện từ (EMF) gây nhiễu loạn trường năng lượng sinh học của cơ thể? Đó là lý do ngồi trade lâu bạn hay bị mệt mỏi vô cớ, dễ cáu gắt.\n\nGiải pháp của Jennie là đặt một **Cụm Thạch Anh Trắng** ngay cạnh màn hình máy tính. Các tinh thể mọc ra nhiều hướng của cụm đá này hoạt động như một máy lọc khí năng lượng, trung hòa bớt bức xạ xấu.\n\nKhông gian sạch - Tâm trí sạch - Lệnh vào mới chuẩn. Đừng để những yếu tố vô hình cản trở lợi nhuận của bạn.',
      hashtags: ['#CumThachAnhTrang', '#ThachAnhTrang', '#CleanEnergy', '#GemralTrading'],
    },
    {
      content: 'Bạn không thu hút những gì bạn MUỐN, bạn thu hút những gì bạn LÀ.\n\nNếu bạn muốn thu hút những đối tác triệu đô, nhưng bên trong bạn vẫn là tư duy của người làm công ăn lương, sợ rủi ro, thích an phận... thì luật hấp dẫn sẽ không hoạt động.\n\nHãy nâng cấp \'Phần mềm\' (Mindset) của bạn trước. Đọc sách của những vĩ nhân, học cách họ tư duy, cách họ đối mặt với thất bại. Khi tần số rung động của bạn khớp với tần số của sự thành công, những cơ hội lớn sẽ tự động gõ cửa.\n\n\'Be it until you become it\' (Hãy là người đó cho đến khi bạn trở thành người đó).',
      hashtags: ['#IdentityShift', '#GemralMindset', '#PhatTrienBanThan', '#LuatHapDan'],
    },
    {
      content: 'Quyền năng của sự hội tụ: **Set Ngũ Linh Thạch V.I.P 1** ✨\n\nTrong phong thủy và năng lượng học, con số 5 tượng trưng cho sự cân bằng và trọn vẹn (Ngũ hành). Khi bạn cảm thấy cuộc sống đang bị lệch (ví dụ: có tiền nhưng mất sức khỏe, hay có tình yêu nhưng sự nghiệp bấp bênh), đó là lúc bạn cần tái thiết lập trật tự.\n\n**Set Ngũ Linh Thạch** tập hợp đủ 5 trụ đá đại diện cho 5 nguồn năng lượng cốt lõi. Đặt set này ở trung tâm ngôi nhà (Trung cung) sẽ giúp điều phối dòng khí, đảm bảo mọi khía cạnh trong cuộc sống đều được nuôi dưỡng đồng đều.\n\nSự thịnh vượng bền vững không phải là đỉnh cao chót vót, mà là sự cân bằng vững chãi.',
      hashtags: ['#SetNguLinhThach', '#CanBangCuocSong', '#GemralVIP', '#PhongThuyUngDung'],
    },
    {
      content: '🌞 Affirmation cho sự giàu có không giới hạn 🌞\n\n\'Tôi mở rộng tâm thức để đón nhận sự giàu có vô tận của vũ trụ. Tiền đến với tôi từ nhiều nguồn, liên tục và ngày càng gia tăng. Tôi sử dụng tiền vào những mục đích tốt đẹp và tiền lại quay về với tôi gấp bội.\'\n\nHãy comment \'TÔI ĐÓN NHẬN\' để kích hoạt dòng chảy này ngay lập tức nhé!',
      hashtags: ['#MoneyMagnet', '#Affirmation', '#GemralWealth', '#TuDuyTichCuc'],
    },
    {
      content: 'Định mệnh hay do mình chọn? Bí mật của **Set Duyên Định Kim Sinh** 💞\n\nNhiều người than ế, than khổ vì tình. Nhưng thực ra, chính những tổn thương cũ (Trauma) đang phát ra tín hiệu đẩy tình yêu ra xa.\n\n**Set Duyên Định Kim Sinh** là sự kết hợp đặc biệt giữa Thạch anh hồng (Tình yêu) và Thạch anh tím (Trí tuệ). Nó giúp bạn yêu một cách tỉnh thức. Không mù quáng, không bi lụy.\n\nKhi sử dụng set này để thiền định, hãy đặt ý niệm: \'Tôi thu hút một mối quan hệ lành mạnh, tôn trọng và cùng nhau phát triển\'. Năng lượng của đá sẽ giúp bạn lọc bớt những mối duyên \'toxic\' và hút về người thực sự cùng tần số.',
      hashtags: ['#SetDuyenDinhKimSinh', '#SoulmateManifestation', '#TinhYeuTinhThuc', '#GemralLove'],
    },
    {
      content: 'Thang đo ý thức Hawkins - Bạn đang ở mức nào?\n\nTiến sĩ David Hawkins đã chứng minh mỗi cảm xúc đều có một tần số rung động (tính bằng Log):\n- Nhục nhã: 20 (Thấp nhất)\n- Sợ hãi: 100\n- Giận dữ: 150\n- Can đảm: 200 (Mốc chuyển hóa tích cực)\n- Tình yêu: 500\n- Bình an: 600\n\nKhi bạn trade thua mà cay cú, bạn đang ở mức 150. Khi bạn sợ mất tiền, bạn ở mức 100. Ở mức này, bạn chỉ hút thêm rắc rối.\n\nHãy cố gắng nâng mình lên mức \'Chấp nhận\' (350) hoặc \'Lý trí\' (400) trước khi ra quyết định đầu tư. Hiệu quả sẽ khác hẳn đấy!',
      hashtags: ['#HawkinsScale', '#TanSoRungDong', '#GemralKnowledge', '#QuanTriCamXuc'],
    },
    {
      content: 'Chiêu tài lộc bất ngờ với **Thiên Lộc - Vòng Thạch Anh Vàng Charm Tỳ Hưu** 🐉\n\nTỳ Hưu là linh vật số 1 về cầu tài (chỉ ăn vàng bạc, không có hậu môn - giữ tiền). Thạch anh vàng là viên đá của sự thịnh vượng.\n\nSự kết hợp trong **Vòng tay Thiên Lộc** tạo ra hiệu ứng kép: Vừa thu hút cơ hội kiếm tiền (đặc biệt là các khoản lợi nhuận từ trading, kinh doanh), vừa giúp bạn giữ chặt túi tiền, tránh thất thoát vô lý.\n\nLưu ý: Khi đeo vòng này, hãy thường xuyên chạm vào Tỳ Hưu và thầm nhắc nhở về mục tiêu tài chính của bạn. Đó là cách bạn \'giao tiếp\' với năng lượng của vật phẩm.',
      hashtags: ['#ThienLoc', '#TyHuu', '#ThachAnhVang', '#GemralJewelry', '#HutTaiLoc'],
    },
    {
      content: 'Tại sao phải viết Nhật ký biết ơn vào buổi sáng? ☀️\n\nKhi vừa thức dậy, não bộ của bạn như một trang giấy trắng. Nếu bạn viết ngay những điều biết ơn, bạn đang \'tô màu\' hạnh phúc cho cả ngày hôm đó.\n\nThay vì cầm điện thoại lướt tin tức (nạp rác), hãy cầm bút lên và viết 5 điều bạn biết ơn. Có thể là giấc ngủ ngon, là cơ thể khỏe mạnh, là công việc hiện tại...\n\nNăng lượng của sự biết ơn vào buổi sáng sẽ tạo đà (Momentum) cho những điều tốt đẹp kéo đến suốt cả ngày. Thử đi, chỉ mất 5 phút thôi!',
      hashtags: ['#MorningRoutine', '#GratitudeJournal', '#GemralLifestyle', '#KhoiDauNgayMoi'],
    },
    {
      content: 'Tìm lại sự tĩnh tại giữa bão market với **Set Thanh Tâm Thạch** 🧘‍♂️\n\nThị trường xanh đỏ, lòng người đảo điên. Nếu tâm bạn động, bạn sẽ mất tiền. \'Thanh Tâm\' nghĩa là làm trong sạch tâm trí.\n\n**Set Thanh Tâm Thạch** (chủ đạo là Thạch anh vàng và trụ đá) giúp ổn định Luân xa Búi Mặt Trời - trung tâm của cảm xúc và ý chí. Khi bạn cảm thấy hoang mang, hãy ngồi tĩnh lặng bên set đá này, hít thở sâu.\n\nKhi tâm tĩnh lặng, trí tuệ mới phát sinh. Một quyết định sáng suốt lúc bình tâm đáng giá hơn ngàn lần những cú click chuột lúc hoảng loạn.',
      hashtags: ['#SetThanhTamThach', '#TamBatBien', '#GemralTrading', '#MeditationSupport'],
    },
    {
      content: 'Điều gì đang ngăn cản bạn trở nên giàu có?\n\nA. Thiếu kiến thức đầu tư.\nB. Thiếu vốn.\nC. Sợ thất bại / Sợ rủi ro.\nD. Cảm thấy mình không xứng đáng.\n\nThành thật với chính mình nhé! 80% rào cản nằm ở C và D (Tâm lý/Niềm tin giới hạn). Nếu gỡ bỏ được tảng đá tâm lý này, A và B sẽ tự nhiên có giải pháp. Bạn chọn đáp án nào?',
      hashtags: ['#GemralQnA', '#NiemTinGioiHan', '#TuDuyTaiChinh', '#SelfReflection'],
    },
    {
      content: 'Điều hướng cuộc đời với **Set Thất Tinh Bắc Đẩu** ✨\n\nTrong phong thủy, trận đồ Thất Tinh (7 viên đá xếp hình ngôi sao) có khả năng khuếch đại năng lượng cực mạnh. Nó giống như một chiếc la bàn năng lượng, giúp gia chủ không bị lạc lối trong các quyết định quan trọng.\n\n**Set Thất Tinh Bắc Đẩu** của Yinyang Masters được thiết kế để hội tụ linh khí, giúp bạn luôn đi đúng hướng (Right Path) trên hành trình sự nghiệp và đầu tư.\n\nĐặt một tờ giấy viết mục tiêu quan trọng nhất của bạn dưới đĩa thất tinh này. Năng lượng từ 7 viên đá sẽ liên tục \'bơm\' sức mạnh cho mục tiêu đó thành hiện thực.',
      hashtags: ['#SetThatTinhBacDau', '#TranDoThatTinh', '#GemralFengShui', '#DinhHuongCuocDoi'],
    },
    {
      content: 'Thua lỗ là học phí hay là sự trừng phạt? 📉\n\nCách bạn định nghĩa sự việc sẽ quyết định năng lượng của bạn.\nNếu bạn coi thua lỗ là trừng phạt -> Năng lượng Nạn nhân -> Thu hút thêm xui xẻo.\nNếu bạn coi thua lỗ là học phí -> Năng lượng Người học hỏi -> Thu hút trí tuệ và cơ hội gỡ lại.\n\nHãy biết ơn cả những lệnh stoploss. Nó dạy bạn kỷ luật, dạy bạn quản lý vốn. Vũ trụ đang training bạn để cầm được số tiền lớn hơn đấy. Đừng phụ lòng \'Người Thầy\' vĩ đại này.',
      hashtags: ['#TradingLessons', '#GocNhinTichCuc', '#GemralTrading', '#GrowthMindset'],
    },
    {
      content: 'Thanh tẩy năng lượng tồn đọng với **Xô Thơm Trắng Combo** 🌿\n\nTrước khi thực hiện bất kỳ nghi thức Manifest nào, hoặc khi bạn vừa chuyển đến văn phòng mới, nhà mới... việc đầu tiên là phải làm sạch năng lượng cũ (Energy Clearing).\n\nĐốt một bó **Xô Thơm Trắng**, để khói len lỏi vào từng ngóc ngách. Mùi hương thảo mộc không chỉ diệt khuẩn mà còn xua đuổi tà khí, đưa không gian về trạng thái cân bằng (Zero state).\n\nKhi không gian sạch, đá năng lượng mới phát huy tối đa tác dụng, và Luật Hấp Dẫn mới vận hành trơn tru được.',
      hashtags: ['#XoThomTrang', '#Smudging', '#ThanhTayKhongGian', '#GemralRitual'],
    },
    {
      content: 'Câu chuyện cái cây tre và sự kiên nhẫn 🌱\n\nCây tre mất 4 năm chỉ để mọc vài cm, nhưng năm thứ 5 nó cao vút lên hàng chục mét. 4 năm đó nó làm gì? Nó phát triển bộ rễ.\n\nChúng ta cũng vậy. Những lúc bạn thiền định, học hỏi, rèn luyện tâm thức... mà chưa thấy tiền về, đừng nản. Đó là lúc bạn đang cắm rễ. Bộ rễ tâm thức càng sâu, sự thịnh vượng sau này càng vững bền.\n\nĐừng so sánh chương 1 của mình với chương 20 của người khác. Hãy kiên trì tưới tắm cho khu vườn tâm trí của bạn mỗi ngày.',
      hashtags: ['#BambooStory', '#KienTri', '#GemralMotivation', '#PhatTrienBenVung'],
    },
    {
      content: 'Lập kết giới bảo vệ toàn diện với **Set Lục Thần Phù** 🛡️\n\nTrong giai đoạn thị trường biến động hoặc tháng \'cô hồn\', năng lượng âm thường rất mạnh. Bạn cần một lá chắn bảo vệ (Shielding).\n\n**Set Lục Thần Phù** bao gồm các trụ đá và cụm đá được sắp xếp để trấn giữ 6 phương hướng. Nó giúp ngăn chặn các dòng năng lượng xấu xâm nhập vào không gian sống và làm việc của bạn.\n\nAn cư mới lạc nghiệp. Khi bạn cảm thấy an toàn trong chính ngôi nhà của mình, tâm trí bạn mới đủ thảnh thơi để sáng tạo và kiếm tiền.',
      hashtags: ['#SetLucThanPhu', '#ProtectionShield', '#TranTrach', '#GemralSafe'],
    },
    {
      content: 'Luật Giả Định (Law of Assumption) - Nâng cấp của Luật Hấp Dẫn 🚀\n\nNeville Goddard dạy rằng: Đừng cố thu hút, hãy GIẢ ĐỊNH rằng nó đã là của bạn.\n\nThay vì nghĩ: \'Tôi hy vọng sẽ có lãi\', hãy mặc định: \'Tôi là một trader có lãi. Lợi nhuận là điều hiển nhiên\'.\nKhi bạn giả định một điều gì đó là sự thật, hành vi, lời nói và năng lượng của bạn sẽ tự động điều chỉnh theo.\n\nHãy sống như thể ước mơ của bạn là một sự thật hiển nhiên (Done deal). Vũ trụ không có lựa chọn nào khác ngoài việc hiện thực hóa nó.',
      hashtags: ['#LawOfAssumption', '#NevilleGoddard', '#GemralMastery', '#NiemTinTuyetDoi'],
    },
    {
      content: 'Kích hoạt giác quan thứ 6 bằng mùi hương: **Sky \'Thiên Ngữ\' - Tinh Dầu Nước Hoa JÉRIE** 🌬️\n\nMùi hương là con đường ngắn nhất đi đến vùng cảm xúc và ký ức của não bộ. Để kết nối với Higher Self (Chân ngã), mình thường sử dụng mùi hương như một chất dẫn (Trigger).\n\n**Sky \'Thiên Ngữ\'** có nốt hương thanh khiết, bay bổng, giúp tâm trí thoát khỏi những lo toan trần tục. Trước khi ngồi thiền hoặc viết nhật ký, hãy chấm một chút tinh dầu lên cổ tay hoặc máy xông.\n\nMùi hương này sẽ báo hiệu cho tiềm thức: \'Đã đến lúc kết nối với trí tuệ vũ trụ\'.',
      hashtags: ['#SkyThienNgu', '#Jerie', '#Aromatherapy', '#GemralSoul', '#KetNoiTamLinh'],
    },
    {
      content: '✨ Khẳng định giá trị bản thân ✨\n\n\'Tôi không cần phải chứng minh gì với ai cả. Giá trị của tôi là nội tại và bất biến. Tôi tỏa sáng theo cách riêng của mình và thu hút những người trân trọng giá trị đó.\'\n\nĐừng chạy theo tiêu chuẩn của xã hội. Khi bạn tự tin là chính mình, bạn là thỏi nam châm quyến rũ nhất.',
      hashtags: ['#SelfWorth', '#Affirmation', '#GemralInspiration', '#TuTinToaSang'],
    },
    {
      content: 'Xây dựng nền móng vững chắc với **Set Tứ Trụ** 🏛️\n\nMột ngôi nhà muốn cao phải có móng và cột trụ vững. Cuộc đời bạn cũng vậy. 4 trụ cột: Tài chính - Sức khỏe - Tình cảm - Trí tuệ cần được củng cố đồng thời.\n\n**Set Tứ Trụ** gồm 4 trụ đá lớn đại diện cho 4 khía cạnh này. Đặt set này ở phòng khách hoặc phòng làm việc để tạo thế vững chãi, không bị lung lay trước bão tố cuộc đời.\n\nMuốn đi xa, phải đi vững. Đừng xây lâu đài trên cát, hãy xây trên nền đá tảng.',
      hashtags: ['#SetTuTru', '#NenTangVungChac', '#GemralLifestyle', '#CanBang'],
    },
    {
      content: 'Phương pháp Manifest với Nước (2 Cup Method) 🥤\n\nChuẩn bị 2 ly nước. Ly 1 dán nhãn \'Hiện tại\' (VD: Đang nợ). Ly 2 dán nhãn \'Mong muốn\' (VD: Tự do tài chính).\nĐổ nước từ ly 1 sang ly 2. Trong lúc đổ, hãy cảm nhận sự chuyển dịch năng lượng, bạn đang nhảy từ dòng thời gian này sang dòng thời gian khác (Quantum Jump).\nUống hết nước ở ly 2 và tin tưởng rằng quá trình chuyển hóa đã bắt đầu.\n\nNước có khả năng lưu trữ ký ức và năng lượng (như TS. Masaru Emoto đã chứng minh). Hãy dùng nước để lập trình lại thực tại của bạn.',
      hashtags: ['#2CupMethod', '#QuantumJumping', '#GemralTips', '#WaterMemory'],
    },
    {
      content: 'Kích hoạt \'Long mạch\' tài chính cá nhân với **Thiên Vượng - Vòng Thạch Anh Vàng Charm Tỳ Hưu** 💰\n\nNếu như \'Thiên Lộc\' là lộc trời cho, thì **Thiên Vượng** là sự thịnh vượng bền vững do chính năng lực của bạn tạo ra. \n\nSự kết hợp giữa Thạch anh vàng (viên đá của sự tự tin và logic) với Tỳ Hưu (linh vật nuốt tiền) tạo ra một vòng lặp năng lượng: Kiếm tiền giỏi -> Giữ tiền chặt. \n\nĐặc biệt với anh em trader hay hold coin, đeo vòng này giúp neo giữ tâm lý \'bàn tay kim cương\' (Diamond Hand), không bị run tay chốt non hay cắt lỗ hoảng loạn. Tâm vững thì tiền mới tụ.',
      hashtags: ['#ThienVuong', '#TyHuu', '#ThachAnhVang', '#GemralTrading', '#TamLyVung'],
    },
    {
      content: 'Cảm giác tội lỗi khi tiêu tiền (Money Guilt) - Rào cản vô hình của sự giàu có 🚫\n\nBạn vừa chốt lời một lệnh ngon, tự thưởng cho mình một món đồ hiệu, nhưng sau đó lại thấy... tiếc tiền hoặc thấy có lỗi? Đó là dấu hiệu của \'Tâm thức nghèo khó\' (Poverty Consciousness).\n\nKhi bạn cảm thấy tội lỗi vì xài tiền, bạn đang nói với Vũ trụ rằng: \'Tôi không xứng đáng\' hoặc \'Tiền là thứ khó kiếm\'. Và Vũ trụ sẽ đồng ý với bạn bằng cách làm cho tiền khó kiếm hơn.\n\nHãy thay đổi: Mỗi lần chi tiền (dù là trả hóa đơn điện nước), hãy nói thầm: \'Cảm ơn số tiền này đã phục vụ tôi. Hãy đi và rủ thêm bạn bè quay lại gấp 10 lần nhé\'. Hãy tiêu tiền trong sự hoan hỷ (High Vibe Spending).',
      hashtags: ['#MoneyMindset', '#HighVibeSpending', '#GemralWealth', '#LuatHapDan'],
    },
    {
      content: 'Cân bằng năng lượng Âm Dương trong tình yêu với **Song Định Duyên Ngọc** 💑\n\nTrong một mối quan hệ, nếu một người quá lấn lướt (Dương quá vượng) hoặc cả hai đều thụ động (Âm quá vượng) thì rất dễ toang. Tình yêu cần sự hòa hợp (Harmony).\n\n**Song Định Duyên Ngọc** là cặp viên đá thạch anh hồng được chế tác để đi đôi với nhau. Bạn giữ một viên, người ấy giữ một viên. Hoặc nếu độc thân, bạn đặt cả hai ở góc Tây Nam phòng ngủ.\n\nNăng lượng cộng hưởng từ cặp đá này giúp kết nối tâm thức hai người, xoa dịu những xung đột và gia tăng sự thấu hiểu không lời (Telepathy).',
      hashtags: ['#SongDinhDuyenNgoc', '#ThachAnhHong', '#CoupleGoals', '#GemralLove'],
    },
    {
      content: 'Kỹ thuật 55x5 - \'Thần chú\' viết tay cho người kiên trì ✍️\n\nBạn muốn manifest một số tiền cụ thể hay một vị trí công việc? Hãy thử phương pháp này:\n1. Chọn một câu khẳng định ngắn gọn (VD: \'Tôi biết ơn vì đã có 100 triệu trong tài khoản\').\n2. Viết câu đó 55 lần liên tục trong 1 lần ngồi.\n3. Lặp lại việc này trong 5 ngày liên tiếp.\n\nTại sao nó hiệu quả? Vì nó buộc tâm trí bạn phải tập trung cao độ (Laser Focus) vào mục tiêu trong một khoảng thời gian đủ dài để khắc sâu vào tiềm thức. Khi viết, hãy cảm nhận từng con chữ như thể nó đã là sự thật.',
      hashtags: ['#55x5Method', '#ManifestationTechnique', '#GemralTips', '#SucManhSuTapTrung'],
    },
    {
      content: 'Trấn trạch và an thần với **Huyền Vũ Thạch** (Trụ thạch anh tím) 🐢\n\nTrong Tứ Tượng, Huyền Vũ là linh vật trấn giữ phương Bắc, tượng trưng cho sự ổn định và trường thọ. **Huyền Vũ Thạch** mang năng lượng của sự bảo bọc và tâm linh.\n\nNếu bạn hay bị mất ngủ, mộng mị, hay bị \'bóng đè\' (dấu hiệu hào quang yếu), hãy đặt trụ đá này ở đầu giường. Tần số của thạch anh tím sẽ tạo ra một màn chắn năng lượng, ngăn chặn các tần số thấp xâm nhập giấc ngủ của bạn.\n\nNgủ ngon là nền tảng của một tâm trí minh mẫn để kiếm tiền vào ngày hôm sau.',
      hashtags: ['#HuyenVuThach', '#ThachAnhTim', '#GiacNguNgon', '#GemralProtection'],
    },
    {
      content: '✨ Khẳng định cho Sức khỏe và Sức sống ✨\n\n\'Cơ thể tôi là một ngôi đền thiêng liêng. Tôi biết ơn từng nhịp thở, từng nhịp tim đang nuôi dưỡng sự sống này. Mỗi ngày trôi qua, tôi càng trở nên khỏe mạnh, dẻo dai và tràn đầy năng lượng.\'\n\nSức khỏe là con số 1, tiền bạc danh vọng là những số 0 phía sau. Mất số 1 thì chuỗi số 0 vô nghĩa. Hãy trân trọng cơ thể mình nhé Gemral-er!',
      hashtags: ['#HealthAffirmation', '#GemralHealth', '#ThanTamAnLac', '#BietOnCoThe'],
    },
    {
      content: 'Sự sắc bén của Kim tiền: **Kim Ngân Trụ** (Trụ thạch anh vàng) 🗡️\n\nKhác với dạng cụm tỏa năng lượng ra xung quanh, dạng Trụ (Point) của **Kim Ngân Trụ** giúp tập trung năng lượng vào một điểm. Đây là bảo vật cho những ai cần sự tập trung cao độ (Focus) để phân tích số liệu, chart nến.\n\nĐặt trụ này trên bàn làm việc, hướng mũi nhọn lên trên để kích hoạt luân xa Thái Dương (Solar Plexus). Nó giúp bạn:\n- Ra quyết định dứt khoát (Cắt lỗ/Chốt lời không do dự).\n- Tăng cường sự tự tin vào nhận định của bản thân.\n- Thu hút dòng tiền từ những quyết định sáng suốt đó.',
      hashtags: ['#KimNganTru', '#ThachAnhVang', '#LaserFocus', '#GemralTrading'],
    },
    {
      content: 'Câu chuyện về \'Giả vờ cho đến khi thành thật\' (Fake it till you make it) - Phiên bản đúng.\n\nNhiều người hiểu sai câu này là phải sống ảo, khoe mẽ. Không phải!\n\nCó một anh bạn trader của mình, lúc tài khoản còn nhỏ xíu, anh ấy đã hành xử như một quỹ đầu tư chuyên nghiệp. Anh viết nhật ký giao dịch chỉn chu, quản lý vốn chặt chẽ, không cay cú ăn thua. Anh ấy \'giả vờ\' (đóng vai) là một Pro Trader trong tâm thức.\n\nKết quả? Vũ trụ đã phản hồi lại đúng cái \'vai\' mà anh ấy đóng. Bây giờ anh ấy quản lý quỹ thật. \n\nBài học: Hãy định vị mình là ai trong tâm trí trước, thực tại bên ngoài sẽ chạy theo sau để khớp với định vị đó.',
      hashtags: ['#IdentityShifting', '#GemralStory', '#TradingMindset', '#LuatHapDan'],
    },
    {
      content: 'Kiến tạo đế chế với **Set Ngũ Đại Thạch** 🏛️\n\nKhi doanh nghiệp của bạn bắt đầu mở rộng, hoặc danh mục đầu tư của bạn đa dạng hóa, bạn cần một cấu trúc năng lượng lớn hơn để \'chống đỡ\'.\n\n**Set Ngũ Đại Thạch** gồm 5 trụ đá lớn, trấn giữ 5 phương vị. Nó giống như 5 vị tướng quân bảo vệ thành trì của bạn. Năng lượng của set này giúp:\n- Củng cố vị thế người đứng đầu.\n- Ổn định dòng tiền (Cashflow).\n- Hóa giải xung khắc trong nội bộ.\n\nMuốn đi nhanh thì đi một mình, muốn đi xa và bền thì cần nền móng năng lượng vững chắc.',
      hashtags: ['#SetNguDaiThach', '#BigBossEnergy', '#GemralBusiness', '#PhongThuyCaoCap'],
    },
    {
      content: 'Q: Bạn có dám GIÀU không? 🤔\n\nNghe hỏi thừa quá nhỉ? Ai chẳng muốn giàu. Nhưng tiềm thức thì chưa chắc.\nNhiều người sợ giàu vì: Sợ bạn bè xa lánh, sợ bị người khác nhờ vả, sợ con cái hư hỏng, sợ nhiều tiền thì nhiều rắc rối...\n\nNhững nỗi sợ ngầm (Subconscious Fears) này chính là phanh tay kìm hãm chiếc xe tài chính của bạn. Bạn đạp ga (cố gắng kiếm tiền) nhưng phanh tay chưa hạ (nỗi sợ) thì xe chỉ bốc khói chứ không chạy.\n\nHãy comment một nỗi sợ về tiền bạc mà bạn từng có, chúng ta cùng nhau gỡ bỏ nó nhé!',
      hashtags: ['#GemralQnA', '#MoneyBlocks', '#FearOfSuccess', '#TuDuyThinhVuong'],
    },
    {
      content: 'Tam giác vàng của sự thịnh vượng: **Set Tam Bảo Thạch** 🔺\n\nTrong hình học thiêng (Sacred Geometry), hình tam giác là cấu trúc vững chãi nhất. **Set Tam Bảo Thạch** hội tụ 3 loại đá quyền năng nhất:\n- Thạch anh Tím: Trí tuệ, Tâm linh (Đỉnh tam giác - Dẫn đường).\n- Thạch anh Vàng: Tài lộc, Ý chí (Góc đáy - Hành động).\n- Thạch anh Hồng/Trắng: Kết nối, Thanh lọc (Góc đáy - Cân bằng).\n\nĐây là set đá \'Must-have\' cho những ai mới bắt đầu chơi đá nhưng muốn có tác dụng toàn diện. Nó giúp bạn không bị lệch pha: Kiếm tiền nhưng vẫn giữ được sự sáng suốt và an lạc.',
      hashtags: ['#SetTamBaoThach', '#SacredGeometry', '#GemralStarter', '#NangLuongTamGiac'],
    },
    {
      content: 'Đừng check điện thoại ngay khi mở mắt! 📵\n\n15 phút đầu tiên sau khi thức dậy là lúc sóng não chuyển từ Delta/Theta sang Alpha. Đây là lúc tiềm thức mở cửa hoàn toàn. Nếu bạn lướt News, xem giá coin, đọc tin drama... bạn đang nạp rác và sự lo âu thẳng vào tiềm thức cho cả ngày dài.\n\nThay vào đó: Nằm yên, mỉm cười, nói lời biết ơn, hoặc hình dung về mục tiêu trong ngày. Hãy làm chủ buổi sáng để làm chủ cuộc đời. Market vẫn ở đó, không chạy mất đâu mà vội.',
      hashtags: ['#MorningRoutine', '#AlphaState', '#GemralTips', '#LamChuTamTri'],
    },
    {
      content: 'Kích hoạt tần số cao cho không gian với **Thiên Bảo Hương - Trầm Hương Cao Cấp** 🌬️\n\nTrước khi ngồi vào bàn làm việc hay bàn thờ thần tài, Jennie luôn đốt một nụ trầm **Thiên Bảo Hương**.\n\nHương trầm được mệnh danh là \'Vua của các mùi hương\' trong phong thủy. Nó có khả năng:\n- Tẩy uế, trừ tà khí, ám khí.\n- Kích hoạt năng lượng Dương.\n- Làm dịu thần kinh, đưa não bộ vào trạng thái tập trung sâu (Flow).\n\nKết hợp khói trầm hương với đá thạch anh là cách nhanh nhất để tạo ra một \'Thánh địa\' (Sanctuary) ngay tại góc làm việc của bạn.',
      hashtags: ['#ThienBaoHuong', '#TramHuong', '#ThanhTay', '#GemralRitual'],
    },
    {
      content: '✨ Khẳng định cho sự tin tưởng tuyệt đối ✨\n\n\'Mọi sự an bài đều là tốt nhất. Tôi tin tưởng vào kế hoạch của Vũ trụ dành cho tôi. Dù hiện tại có ra sao, tôi biết mình đang được dẫn dắt đến đúng nơi tôi cần đến, vào đúng thời điểm tôi cần có mặt.\'\n\nĐọc câu này mỗi khi bạn cảm thấy hoang mang, mất phương hướng hoặc khi thị trường đi ngược lại dự đoán của bạn. Buông bỏ sự kiểm soát là đỉnh cao của kiểm soát.',
      hashtags: ['#TrustTheUniverse', '#Affirmation', '#GemralSoul', '#BinhAn'],
    },
    {
      content: 'Sự sinh sôi nảy nở của tài sản: **Đế Vượng - Cây Đại Lộc** 🌳\n\nKhác với trụ đá (năng lượng thẳng, mạnh), **Đế Vượng** được chế tác hình cây với hàng trăm tinh thể thạch anh vàng. Hình tượng này mang ý nghĩa của sự sinh sôi, nảy nở, đâm chồi nảy lộc.\n\nĐây là vật phẩm cực tốt để đặt ở quầy thu ngân, két sắt hoặc góc tài vị. Nó phát ra tần số: \'Tiền của tôi liên tục sinh sôi, dòng tiền này nối tiếp dòng tiền kia\'.\n\nĐầu tư là gieo hạt, và **Cây Đại Lộc** là biểu tượng của mùa gặt bội thu.',
      hashtags: ['#DeVuong', '#CayDaiLoc', '#ThachAnhVang', '#PhatTrienTaiSan', '#GemralFengShui'],
    },
    {
      content: 'Tế bào gương (Mirror Neurons) và Lý do bạn cần chọn bạn mà chơi 🧠\n\nKhoa học não bộ đã tìm ra \'Tế bào gương\' - loại tế bào thần kinh giúp chúng ta mô phỏng lại hành vi và cảm xúc của người khác một cách vô thức.\n\nNếu bạn chơi với người hay than vãn, tế bào gương sẽ copy sự than vãn đó. Nếu bạn chơi với người giàu năng lượng, tích cực, tế bào gương sẽ copy sự tự tin và tư duy của họ.\n\nLuật Hấp Dẫn không chỉ là \'mây tầng nào gặp mây tầng đó\', mà còn là \'gần mực thì đen, gần đèn thì sáng\' theo nghĩa đen của sinh học. Hãy follow những người thành công trên Gemral, đọc bài viết của họ, tương tác với họ để \'hack\' não bộ của chính mình nhé!',
      hashtags: ['#MirrorNeurons', '#MoiTruong', '#GemralKnowledge', '#KhoaHocTamThuc'],
    },
    {
      content: 'Khai mở con mắt thứ ba và bảo vệ tâm trí với **Set Thiên Nhãn - Vòng đá Sức Mạnh** 👁️\n\nTrong thế giới thông tin hỗn loạn (FUD, Fake news), khả năng nhìn thấu sự thật là quan trọng nhất.\n\n**Set Thiên Nhãn** kết hợp Thạch anh trắng (Sự sáng suốt) và Hematite (Sự bảo vệ). Đeo set này giúp bạn:\n- Tăng cường sự tập trung cao độ.\n- Lọc bỏ nhiễu loạn thông tin.\n- Nhận diện được đâu là cơ hội thật, đâu là bẫy.\n\nNó như một tấm màng lọc năng lượng, chỉ cho phép sự thật và trực giác đi vào tâm trí bạn.',
      hashtags: ['#SetThienNhan', '#MatThuBa', '#ClearVision', '#GemralJewelry'],
    },
    {
      content: 'Tư duy Khan hiếm (Scarcity) vs Tư duy Dư dả (Abundance) ⚡️\n\n- Khan hiếm: \'Miếng bánh chỉ có bấy nhiêu, người khác ăn hết thì mình nhịn\'. -> Dẫn đến ghen tị, tranh giành, FOMO.\n- Dư dả: \'Vũ trụ là vô tận. Thành công của người khác là bằng chứng cho thấy tôi cũng có thể làm được\'. -> Dẫn đến chúc mừng, học hỏi, bình an.\n\nKhi thấy ai đó khoe lãi trên Gemral, bạn cảm thấy gì? Ghen tị hay Chúc mừng? Cảm xúc đó sẽ quyết định bạn có hút được số tiền đó về mình hay không. Hãy tập chúc mừng thành công của người khác như thể đó là của chính mình!',
      hashtags: ['#AbundanceMindset', '#ScarcityVsAbundance', '#GemralMindset', '#ChucMung'],
    },
    {
      content: 'Kích hoạt năng lượng Nữ hoàng với **Set Phượng Nghi Thạch** 👑\n\nDành riêng cho các nữ chủ nhân của Gemral. Phụ nữ làm kinh doanh/đầu tư thường dễ bị cuốn theo năng lượng nam tính (cạnh tranh, khô khan).\n\n**Set Phượng Nghi Thạch** (kết hợp Thạch anh hồng, trắng và trụ đá) giúp khôi phục năng lượng Nữ tính thiêng liêng (Divine Feminine). Đó là sự quyền lực mềm: Thu hút thay vì rượt đuổi, Cảm nhận thay vì toan tính.\n\nKhi bạn ở trạng thái \'Phượng Nghi\' (Uy nghi như Phượng hoàng), bạn không cần gồng mình lên chứng tỏ. Bạn tỏa sáng và mọi thứ tốt đẹp tự động bị hút về phía bạn.',
      hashtags: ['#SetPhuongNghiThach', '#DivineFeminine', '#NuChu', '#GemralQueen'],
    },
    {
      content: 'Đã đến lúc Update lại Vision Board (Bảng tầm nhìn) của bạn! 📌\n\nChúng ta thay đổi mỗi ngày. Mục tiêu bạn đặt ra 6 tháng trước có thể không còn phù hợp với tần số hiện tại của bạn nữa.\n\nHãy dành cuối tuần này để review lại Vision Board:\n- Mục tiêu nào đã đạt được? -> Biết ơn và gỡ xuống (hoặc dán tem \'Done\').\n- Mục tiêu nào không còn cảm xúc? -> Mạnh dạn bỏ đi.\n- Bạn muốn thêm điều gì mới mẻ vào cuộc sống?\n\nGiữ cho Vision Board luôn tươi mới (Fresh) là cách để giữ cho năng lượng hào hứng luôn tuôn chảy. Đừng để nó bám bụi nhé!',
      hashtags: ['#VisionBoardUpdate', '#LamMoiNangLuong', '#GemralTips', '#MucTieuMoi'],
    },
    {
      content: 'Thiên thời - Địa lợi - Nhân hòa: Kích hoạt với **Set Tam Thiên Thạch** 🌌\n\nTrong kinh doanh và đầu tư, đôi khi bạn nỗ lực (Nhân) nhưng thời thế chưa tới (Thiên) hoặc môi trường không ủng hộ (Địa) thì vẫn khó thành công.\n\n**Set Tam Thiên Thạch** được thiết kế dựa trên nguyên lý Tam Tài. Ba trụ đá đại diện cho sự kết nối trục dọc giữa Trời - Người - Đất. \n\nKhi đặt set này ở bàn làm việc, bạn đang tạo ra một cột ăng-ten thu hút vận may từ vũ trụ (Thiên), sự vững chãi từ đất mẹ (Địa) và sự sáng suốt của chính mình (Nhân). Khi 3 yếu tố này thẳng hàng (Alignment), sự thịnh vượng là điều tất yếu.',
      hashtags: ['#SetTamThienThach', '#TamTai', '#ThienDiaNhan', '#GemralFengShui'],
    },
    {
      content: 'Khoảng không (The Void) - Dấu hiệu trước khi điều kỳ diệu xảy ra ⚫️\n\nCó bao giờ bạn cảm thấy cuộc sống bỗng nhiên... chững lại? Mọi thứ im ắng, không có gì xấu cũng chẳng có gì tốt xảy ra, cảm giác trống rỗng?\n\nĐừng sợ! Đó là \'The Void\' - khoảng lặng trước cơn bão của sự chuyển hóa. Vũ trụ đang dọn dẹp những cái cũ để lấy chỗ cho cái mới (Manifestation) xuất hiện.\n\nĐừng lấp đầy khoảng không này bằng sự lo lắng hay những thú vui rẻ tiền. Hãy kiên nhẫn, giữ tần số cao và chờ đợi. \'Boom\' sắp tới rồi!',
      hashtags: ['#TheVoid', '#TrustTheProcess', '#GemralKnowledge', '#ChuyenHoa'],
    },
    {
      content: 'Sức hút bí ẩn của người phụ nữ khí chất: **Dạ Nguyệt - Vòng Thạch Anh Tím Charm Vô Cực** 🌙\n\nQuyến rũ không phải là hở hang. Quyến rũ là sự bí ẩn và chiều sâu tâm hồn.\n\nThạch anh tím (Amethyst) trong chiếc vòng **Dạ Nguyệt** mang năng lượng của sự thông tuệ và trực giác nhạy bén. Charm Vô Cực (Infinity) tượng trưng cho tiềm năng không giới hạn.\n\nKhi đeo chiếc vòng này, bạn phát ra tần số của một người phụ nữ \'biết mình muốn gì\'. Đó là loại năng lượng thu hút những người đàn ông chất lượng, những người tìm kiếm chiều sâu thay vì vẻ bề ngoài.',
      hashtags: ['#DaNguyet', '#ThachAnhTim', '#KhiChat', '#GemralLady', '#VoCuc'],
    },
    {
      content: 'Thí nghiệm của Tiến sĩ Masaru Emoto và ly nước bạn uống mỗi ngày 💧\n\nBạn biết nước có ký ức không? Khi bạn nói lời yêu thương, tinh thể nước đẹp lung linh. Khi bạn chửi rủa, tinh thể nước méo mó.\n\nCơ thể bạn 70% là nước. Nếu bạn suốt ngày tự chê bai mình (\'Sao mình ngu thế\', \'Sao mình xui thế\'), bạn đang làm méo mó chính tế bào của mình.\n\nTừ hôm nay, trước khi uống nước, hãy cầm ly nước và thầm niệm: \'Cảm ơn sự chữa lành, cảm ơn sự thịnh vượng\'. Uống nước phép mỗi ngày để thay đổi vận mệnh từ bên trong tế bào nhé!',
      hashtags: ['#WaterMemory', '#MasaruEmoto', '#GemralHealth', '#ChuaLanhTeBao'],
    },
    {
      content: 'Trụ cột tài chính vững chắc: **Huyền Kim Trụ** (Trụ thạch anh vàng đen/khói) 🏛️\n\nTrong đầu tư, tấn công (kiếm tiền) quan trọng, nhưng phòng thủ (giữ tiền) còn quan trọng hơn. **Huyền Kim Trụ** mang màu sắc pha trộn giữa vàng (Tài lộc) và đen/khói (Hộ thân/Trừ tà).\n\nĐây là vật phẩm dành cho những Trader muốn bảo toàn vốn trước những cú sập của thị trường. Năng lượng của nó giúp bạn nhìn thấu những cái bẫy (Trap), những dự án \'bánh vẽ\', giữ cho túi tiền của bạn luôn an toàn để sinh lời.',
      hashtags: ['#HuyenKimTru', '#QuanLyVon', '#SafeInvesting', '#GemralTrading'],
    },
    {
      content: '✨ Khẳng định về sự Xứng Đáng ✨\n\n\'Tôi xứng đáng với những điều tốt đẹp nhất, không phải vì những gì tôi làm, mà vì bản chất tôi là ai. Tôi buông bỏ nhu cầu phải làm hài lòng người khác. Tôi đón nhận sự giàu có như một lẽ tự nhiên.\'\n\nNhiều người kiếm được tiền rồi lại để mất vì sâu thẳm bên trong họ cảm thấy mình \'không xứng đáng\'. Hãy chữa lành cảm giác này ngay hôm nay.',
      hashtags: ['#SelfWorth', '#Affirmation', '#GemralSoul', '#XungDang'],
    },
    {
      content: 'Kích hoạt vận may tối thượng với **Set Cửu Tinh Thạch** 🌟\n\nSố 9 (Cửu) trong phong thủy là con số của sự viên mãn, cực dương và sự kết thúc để bắt đầu chu kỳ mới tốt đẹp hơn.\n\n**Set Cửu Tinh Thạch** gồm 9 viên đá được tuyển chọn kỹ lưỡng, đại diện cho Cửu Tinh. Khi đặt set này trên bàn làm việc, bạn đang kích hoạt năng lượng của sao Cửu Tử (Hữu Bật) - ngôi sao chủ về danh tiếng, may mắn và sự thăng hoa trong Vận 9 này.\n\nĐừng chỉ làm việc chăm chỉ, hãy làm việc thuận theo thiên thời.',
      hashtags: ['#SetCuuTinhThach', '#Van9', '#PhongThuyHuyenKhong', '#GemralVIP'],
    },
    {
      content: 'Trực giác (Intuition) vs Nỗi sợ (Fear) - Làm sao phân biệt?\n\nTrong trading, đôi khi bạn nghe một giọng nói bảo \'Bán đi\'. Làm sao biết đó là trực giác mách bảo hay nỗi sợ đang lên tiếng?\n\n- **Nỗi sợ:** Thường ồn ào, gấp gáp, cảm thấy bất an ở vùng bụng/ngực. Nó thôi thúc bạn hành động ngay lập tức để trốn chạy.\n- **Trực giác:** Thường tĩnh lặng, nhẹ nhàng, thoáng qua nhưng chắc chắn. Nó cho bạn cảm giác \'Biết\' (Knowing) mà không cần lý do.\n\nHãy tập lắng nghe khoảng lặng bên trong. Thiền định cùng đá thạch anh tím sẽ giúp bạn phân biệt rõ hai giọng nói này.',
      hashtags: ['#TrucGiacVsNoiSo', '#TradingWisdom', '#GemralMindset', '#InnerVoice'],
    },
    {
      content: 'Lá bùa hộ mệnh hiện đại: **Linh Phù - Vòng Hematite Charm Thần Chú OM** 🕉️\n\nBạn hay phải đi công tác xa? Hay làm việc ở những môi trường phức tạp? Bạn cần một vật phẩm \'hộ thân\'.\n\n**Linh Phù** kết hợp sức mạnh của đá Hematite (kim loại nặng, phản hồi năng lượng xấu) và rung động của âm thanh vũ trụ OM. Nó tạo ra một lớp màng bảo vệ (Etheric Shield) quanh bạn.\n\nKhông chỉ tránh tà khí, nó còn giúp bạn giữ vững lập trường, không bị lung lay bởi những lời dèm pha hay dụ dỗ.',
      hashtags: ['#LinhPhu', '#Hematite', '#OmMantra', '#BinhAnMoiNoi', '#GemralProtection'],
    },
    {
      content: 'Nếu bạn biết chắc chắn mình không thể thất bại, bạn sẽ làm gì ngay bây giờ? 🚀\n\nCâu hỏi này giúp gỡ bỏ rào cản sợ hãi để lộ ra khát vọng thực sự của linh hồn bạn. \n- Mở một công ty?\n- Full-time trading?\n- Viết một cuốn sách?\n\nHãy comment điều bạn muốn làm nhất. Khi bạn dám gọi tên giấc mơ, bạn đã đi được 50% chặng đường rồi.',
      hashtags: ['#GemralQnA', '#Fearless', '#DreamBig', '#KhatVong'],
    },
    {
      content: 'Kết nối trí tuệ vô tận với **Dạ Thiên Thạch** (Trụ thạch anh tím đậm) 🌌\n\nCó những vấn đề hóc búa mà logic thông thường không giải quyết được. Bạn cần \'download\' giải pháp từ trí tuệ vũ trụ (Universal Intelligence).\n\n**Dạ Thiên Thạch** với màu tím đậm như bầu trời đêm, là cầu nối mạnh mẽ nhất tới Tàng thức (Akashic Records). Khi bế tắc, hãy đặt tay lên trụ đá này, nhắm mắt và đặt câu hỏi. Câu trả lời thường sẽ đến vào lúc bạn không ngờ nhất (khi đi tắm, khi lái xe...) dưới dạng một ý tưởng lóe sáng (Aha moment).',
      hashtags: ['#DaThienThach', '#ThachAnhTim', '#AkashicRecords', '#SangTao', '#GemralWisdom'],
    },
    {
      content: 'Biết ơn những \'Hóa đơn\' - Hack tư duy tiền bạc 🧾\n\nNghe điên rồ nhỉ? Nhưng mỗi lần bạn trả tiền điện, tiền mạng, tiền nhà... hãy nói \'Cảm ơn\'.\n\nCảm ơn vì tôi có điện để dùng điều hòa mát lạnh. Cảm ơn vì tôi có nhà để ở. Việc bạn có khả năng chi trả đã là một sự giàu có rồi.\n\nĐừng trả tiền với cảm giác \'mất mát\'. Hãy trả tiền với cảm giác \'luân chuyển\'. Dòng tiền đi ra để mang giá trị về, và nó sẽ quay lại với bạn. Thay đổi thái độ khi thanh toán là cách nhanh nhất để chữa lành mối quan hệ với tiền.',
      hashtags: ['#BiKipTaiChinh', '#LongBietOn', '#GemralWealth', '#MoneyFlow'],
    },
    {
      content: 'Chữa lành tổn thương quá khứ với **Set Mộng Hồi Thanh** 🌫️\n\nBạn không thể xây dựng một mối quan hệ mới tuyệt vời trên nền móng của những tổn thương cũ (Trauma). Những nỗi đau bị kìm nén sẽ luôn tìm cách trồi lên phá hoại hiện tại.\n\n**Set Mộng Hồi Thanh** (Kết hợp Thạch anh tím và hồng) mang năng lượng của sự xoa dịu và hồi phục. Nó giúp bạn đi sâu vào tiềm thức, ôm ấp đứa trẻ bên trong (Inner Child) và giải phóng những cảm xúc tắc nghẽn.\n\nHãy buông bỏ hành lý cũ để chuyến xe tương lai được nhẹ nhàng.',
      hashtags: ['#SetMongHoiThanh', '#ChuaLanhTrauma', '#InnerChild', '#GemralHealing'],
    },
    {
      content: 'Vision Board: Nên làm bản cứng hay để hình nền điện thoại?\n\nCâu trả lời là CẢ HAI. \n- Bản cứng treo ở nơi bạn thấy mỗi sáng (kích hoạt ngày mới).\n- Bản mềm cài màn hình điện thoại/máy tính (nhắc nhở tiềm thức liên tục mỗi khi bạn cầm máy).\n\nSự lặp lại (Repetition) là chìa khóa để lập trình lại não bộ. Hãy để mục tiêu bao vây lấy bạn. Ám ảnh tạo ra thành quả.',
      hashtags: ['#VisionBoardTips', '#Focus', '#GemralLifestyle', '#AmAnhMucTieu'],
    },
    {
      content: 'Tam giác cân bằng - Chìa khóa bền vững: **Set Tam Hợp Trụ** ⚖️\n\nTrong trading hay kinh doanh, chúng ta hay bị cuốn vào vòng xoáy \'được ăn cả, ngã về không\'. Sự thiếu ổn định này làm hao tổn phước báu và năng lượng.\n\n**Set Tam Hợp Trụ** gồm 3 trụ đá bổ trợ cho nhau, tạo thế chân kiềng. Nó giúp bạn cân bằng giữa: Rủi ro - Lợi nhuận - An toàn.\n\nĐặt set này ở góc làm việc giúp bạn có những bước đi chắc chắn, chậm mà chắc còn hơn nhanh mà ẩu.',
      hashtags: ['#SetTamHopTru', '#SustainableGrowth', '#DauTuBenVung', '#GemralBusiness'],
    },
    {
      content: 'Abracadabra - \'Tôi tạo ra những gì tôi nói\' 🗣️\n\nBạn có biết từ phép thuật \'Abracadabra\' trong tiếng Aramaic cổ có nghĩa là \'I create as I speak\' không?\n\nLời nói của bạn là những câu thần chú. \nKhi bạn than: \'Chán quá\', \'Hết tiền rồi\' -> Bạn đang phù phép cho cuộc đời mình thêm chán và thêm nghèo.\n\nHãy tập nói ngôn ngữ của sự kiến tạo: \'Tôi đang thu hút...\', \'Tôi đang phát triển...\', \'Cơ hội đang đến...\'.\n\nHãy cẩn trọng với cái miệng của mình, nó là công cụ manifest mạnh mẽ nhất đấy!',
      hashtags: ['#Abracadabra', '#SucManhLoiNoi', '#GemralMagic', '#KienTaoCuocDoi'],
    },
    {
      content: 'Lắng nghe chỉ dẫn từ Đấng Sáng Tạo với **Set Thiên Ý - Thông Điệp Từ Thượng Đế** 🕊️\n\nĐôi khi trong đời, chúng ta đứng trước những ngã rẽ mà lý trí không thể phân định. Đó là lúc cần sự \'thuận Thiên\'.\n\n**Set Thiên Ý** (với chủ đạo là Thạch anh trắng tinh khiết) giúp xóa bỏ cái tôi (Ego) ồn ào, để bạn nghe được tiếng nói nhỏ nhẹ của sự dẫn dắt thiêng liêng.\n\n\'Làm ơn hãy cho con thấy con đường\'. Khi bạn cầu nguyện chân thành bên set đá này, những dấu hiệu (Signs) sẽ xuất hiện rõ ràng hơn bao giờ hết.',
      hashtags: ['#SetThienY', '#DivineGuidance', '#ThuanThien', '#GemralSpirituality'],
    },
    {
      content: 'Sự đồng bộ (Synchronicity) - Khi vũ trụ nháy mắt với bạn 😉\n\nBạn vừa nghĩ tới một cuốn sách, chiều ra đường thấy ai đó cầm đúng cuốn đó. Bạn vừa muốn học về crypto, tự nhiên Youtube đề xuất video phân tích cực hay.\n\nĐó không phải ngẫu nhiên. Đó là Synchronicity - dấu hiệu bạn đang đi đúng dòng chảy (In flow). \n\nKhi gặp những sự trùng hợp này, hãy vui mừng và nói \'Yes!\'. Đừng bỏ qua, hãy hành động ngay theo những gợi ý đó. Vũ trụ đang trải thảm đỏ cho bạn đấy.',
      hashtags: ['#Synchronicity', '#DauHieuVuTru', '#GemralInspiration', '#FlowState'],
    },
    {
      content: 'Công cụ không thể thiếu cho dân chơi hệ tâm linh: **Sổ Tay MANIFEST PHÚC KHÍ 2024** 📖\n\nManifestation không phải là trò may rủi, nó là một bộ môn khoa học của tâm thức. Và mọi nhà khoa học đều cần ghi chép.\n\nCuốn **Sổ Tay MANIFEST PHÚC KHÍ** này không chỉ là sổ trắng. Nó được thiết kế với các template thực hành lòng biết ơn, viết kịch bản (scripting), theo dõi cảm xúc (mood tracker) và những lời nhắc nhở tần số cao mỗi ngày.\n\nĐặt bút xuống là đặt lệnh cho vũ trụ. Đừng để những giấc mơ chỉ nằm trong đầu, hãy vật chất hóa nó ra giấy!',
      hashtags: ['#SoTayManifest', '#PhucKhi2024', '#CongCuManifest', '#GemralTools', '#VietDeHoaHien'],
    },
    {
      content: 'Bạn là Vũ trụ đang trải nghiệm chính mình.\n\nBạn không phải là một giọt nước trong đại dương, bạn là cả đại dương trong một giọt nước (Rumi).\n\nĐừng bao giờ nghĩ mình nhỏ bé hay bất lực. Trong bạn chứa đựng sức mạnh đã tạo ra các vì sao. Khi bạn nhận ra bản chất thần thánh của mình, sự thiếu thốn sẽ biến mất. Và khi sự thiếu thốn biến mất, sự giàu có sẽ lấp đầy chỗ trống đó.\n\nHãy sống hiên ngang như một vị thần đang dạo chơi nhân gian.',
      hashtags: ['#YouAreTheUniverse', '#RumiQuotes', '#GemralSoul', '#ThucTinh'],
    },
    {
      content: 'Gieo hạt giống thịnh vượng với **Bát Nhã Phù Sinh - Cây Thịnh Vượng** 🌱\n\nTrong Luật Hấp Dẫn, có một quy luật gọi là \'Gieo hạt\' (Sowing). Bạn không thể gặt quả nếu chưa từng gieo hạt và chăm bón.\n\n**Bát Nhã Phù Sinh** được thiết kế dưới dạng Cây Tài Lộc với tán lá xum xuê làm từ đá thạch anh. Hình tượng cái cây nhắc nhở tiềm thức về sự sinh trưởng tự nhiên: Từ từ, bền bỉ và vững chãi.\n\nĐặt cây này ở góc tài lộc và mỗi ngày tưới tắm cho nó bằng sự biết ơn. Hãy hình dung tài sản của bạn cũng đang đâm chồi nảy lộc y như cái cây này vậy. Sự giàu có đến từ gốc rễ (tâm thức) mới là sự giàu có bền vững.',
      hashtags: ['#BatNhaPhuSinh', '#CayThinhVuong', '#GieoHat', '#GemralWealth'],
    },
    {
      content: 'Đừng \'muốn\', hãy \'chọn\'.\n\nKhi bạn nói \'Tôi muốn giàu\', vũ trụ nghe thấy sự thiếu thốn (vì thiếu mới muốn).\nKhi bạn nói \'Tôi chọn sự giàu có\', vũ trụ nghe thấy quyền lực của sự ra quyết định.\n\n\'Muốn\' là trạng thái thụ động chờ đợi. \'Chọn\' là trạng thái chủ động kiến tạo.\nSáng nay thức dậy, bạn CHỌN điều gì cho mình? Chọn niềm vui hay chọn sự ủ rũ? Quyền năng nằm ở sự lựa chọn của bạn ngay khoảnh khắc này.',
      hashtags: ['#PowerOfChoice', '#GemralMindset', '#TuDuyKienTao', '#LuatHapDan'],
    },
    {
      content: 'Chinh phục mọi mục tiêu với **Set Ngự Linh Thạch** 🎯\n\n\'Ngự\' là cai quản, điều khiển. \'Linh\' là năng lượng thiêng. **Set Ngự Linh Thạch** dành cho những ai cảm thấy cuộc sống của mình đang mất kiểm soát, trôi dạt vô định.\n\nBộ đá này giúp bạn lấy lại quyền làm chủ (Take control) trường năng lượng của mình. Thay vì bị ngoại cảnh tác động, bạn trở thành người \'Ngự\' trên dòng chảy năng lượng, điều hướng nó vào đúng mục tiêu bạn muốn.\n\nĐừng để cuộc đời xô đẩy, hãy là người cầm lái.',
      hashtags: ['#SetNguLinhThach', '#LamChuCuocDoi', '#Mastery', '#GemralPower'],
    },
    {
      content: 'Tần số của sự Ghen tị (Jealousy) - Kẻ hủy diệt vận may 🚫\n\nKhi lướt mạng xã hội thấy ai đó thành công hơn mình, cảm giác nhói lên trong bạn là gì? Nếu là ghen tị, hãy cẩn thận!\n\nGhen tị là lời khẳng định với vũ trụ rằng: \'Thành công là hữu hạn, họ lấy hết phần của tôi rồi\'. Tần số này đẩy sự thịnh vượng ra xa bạn hàng km.\n\nCách chuyển hóa (Alchemize): Biến Ghen tị thành Cảm hứng (Inspiration). \'Wow, họ làm được nghĩa là điều đó khả thi. Cảm ơn vũ trụ đã cho tôi thấy ví dụ thực tế. Đến lượt tôi rồi!\'.',
      hashtags: ['#JealousyToInspiration', '#ChuyenHoaCamXuc', '#GemralWisdom', '#HighVibe'],
    },
    {
      content: 'Làm dịu những cơn bão cảm xúc với **Set Băng Vũ Thạch** ❄️\n\nTrong đầu tư hay cuộc sống, những quyết định sai lầm nhất thường đến khi cái đầu \'nóng\'. Nóng giận, nóng vội, cay cú.\n\n**Set Băng Vũ Thạch** (Mưa băng) mang năng lượng của nước và sự mát lạnh. Nó giúp hạ nhiệt (Cool down) hệ thần kinh đang căng thẳng cực độ.\n\nKhi cảm thấy máu dồn lên não, hãy ngồi tĩnh lặng bên set đá này 5 phút. Hãy để năng lượng mát lành của nó dập tắt ngọn lửa sân hận, trả lại cho bạn sự điềm tĩnh của một bậc thầy.',
      hashtags: ['#SetBangVuThach', '#CoolDown', '#QuanTriCamXuc', '#GemralHealing'],
    },
    {
      content: '✨ Khẳng định thu hút Quý nhân ✨\n\n\'Tôi luôn được vây quanh bởi những con người tuyệt vời, tài năng và thiện lương. Bất cứ nơi nào tôi đến, tôi đều gặp được quý nhân phù trợ. Tôi biết ơn những mối nhân duyên tốt đẹp đang đến với tôi mỗi ngày.\'\n\nMuốn đi xa hãy đi cùng nhau. Hãy mở lòng đón nhận sự giúp đỡ từ vũ trụ thông qua những con người cụ thể.',
      hashtags: ['#RelationshipMagnet', '#Affirmation', '#GemralNetwork', '#QuyNhan'],
    },
    {
      content: 'Hàn gắn và kết nối ba đời với **Set Tam Sinh Thạch** 💞\n\nTam Sinh là Tiền kiếp - Hiện tại - Tương lai. Đôi khi những trắc trở trong tình cảm hiện tại đến từ những duyên nợ chưa giải quyết trong quá khứ.\n\n**Set Tam Sinh Thạch** (kết hợp 3 loại đá chủ đạo) giúp chữa lành dòng thời gian (Timeline Healing). Nó giúp bạn buông bỏ chấp niệm cũ, trân trọng người trước mặt và cùng nhau hướng tới tương lai.\n\nTình yêu đẹp không phải là không có sóng gió, mà là cùng nhau vượt qua sóng gió để trưởng thành.',
      hashtags: ['#SetTamSinhThach', '#HealingRelationships', '#TinhYeuBenVung', '#GemralLove'],
    },
    {
      content: 'Kỹ thuật \'Tấm Séc Nhiệm Màu\' (The Magic Check) 💸\n\nBạn muốn thu hút một số tiền cụ thể? Hãy viết cho chính mình một tấm séc (Check).\n\n- Người thụ hưởng: Tên bạn.\n- Số tiền: Con số bạn mong muốn (phải khả thi với niềm tin hiện tại của bạn).\n- Ngày tháng: Thời điểm bạn muốn nhận.\n- Ký tên: Vũ trụ (The Universe).\n\nIn tấm séc này ra, để trong ví hoặc dán lên Vision Board. Mỗi lần nhìn thấy nó, đừng hỏi \'tiền đâu\', hãy mỉm cười như thể bạn đang cầm số tiền đó đi shopping vậy. Cảm giác sở hữu (Ownership) là chìa khóa.',
      hashtags: ['#MagicCheck', '#LuatHapDanTaiChinh', '#GemralTips', '#MoneyMagnet'],
    },
    {
      content: 'Tỏa sáng hào quang, thu hút mọi ánh nhìn với **Ngũ Quang Thạch** ✨\n\nBạn có thấy những người thành công luôn có một sức hút kỳ lạ không? Đó là Hào quang (Aura) của họ rất sáng và mạnh.\n\n**Ngũ Quang Thạch** là trụ đá đặc biệt có khả năng khúc xạ ánh sáng tạo ra dải màu ngũ sắc. Nó giúp kích hoạt và làm sáng trường năng lượng bao quanh cơ thể bạn.\n\nKhi Aura của bạn sáng, bạn tự nhiên trở nên tự tin, thu hút và may mắn hơn. Người khác sẽ muốn làm việc với bạn, muốn ở gần bạn mà không hiểu tại sao.',
      hashtags: ['#NguQuangThach', '#AuraBooster', '#Charisma', '#GemralShine'],
    },
    {
      content: 'Q: Mình hay bị nản chí giữa chừng khi thực hành Manifest, làm sao để duy trì?\n\nA: Sự nản chí đến từ việc bạn chăm chăm nhìn vào kết quả (vật chất) mà quên tận hưởng quá trình (tinh thần). \n\nHãy thay đổi mục tiêu: Thay vì mục tiêu là \'Có 1 tỷ\', hãy đặt mục tiêu là \'Trở thành người hạnh phúc và kỷ luật\'. Khi bạn yêu thích con người mình đang trở thành mỗi ngày, kết quả vật chất chỉ là phần thưởng đi kèm (Bonus). Bạn có đang yêu thích hành trình của mình không?',
      hashtags: ['#GemralQnA', '#KienTri', '#EnjoyTheJourney', '#PhatTrienBanThan'],
    },
    {
      content: 'Kết nối với tiềm thức trong màn đêm cùng **Dạ Tinh Trụ** 🌌\n\nBan đêm là lúc ý thức ngủ yên và tiềm thức hoạt động mạnh nhất. Đây là thời điểm vàng để giao tiếp với chính mình.\n\nĐặt **Dạ Tinh Trụ** (Thạch anh tím đậm) ở đầu giường. Trước khi ngủ, hãy thì thầm câu hỏi hoặc vấn đề bạn đang gặp phải với viên đá. Năng lượng của thạch anh tím sẽ dẫn lối cho những giấc mơ tiên tri (Lucid Dream) hoặc giúp bạn thức dậy với một giải pháp rõ ràng trong đầu.\n\nĐừng lãng phí 1/3 cuộc đời chỉ để ngủ, hãy biến nó thành thời gian tu tập.',
      hashtags: ['#DaTinhTru', '#ThachAnhTim', '#DreamWork', '#GemralNight'],
    },
    {
      content: 'Kỷ luật tâm linh với **Sổ Tay CHUYỂN HÓA TÂM LINH - 21 NGÀY SỐNG ĐÚNG PHÁP** 📘\n\nNhiều người nghĩ tâm linh là bay bổng, tùy hứng. Sai lầm! Tâm linh cần kỷ luật sắt đá (Spiritual Discipline).\n\nCuốn sổ tay này không phải để đọc chơi. Nó là một lộ trình hành động (Action Plan) trong 21 ngày để bạn thiết lập lại hệ điều hành tâm thức của mình: Từ cách ăn, cách nói, cách suy nghĩ đến cách hành thiền.\n\nMuốn thay đổi cuộc đời, hãy bắt đầu từ việc thay đổi thói quen trong 21 ngày. Bạn có dám cam kết không?',
      hashtags: ['#SoTayChuyenHoa', '#KyLuatTamLinh', '#GemralTools', '#21DaysChallenge'],
    },
    {
      content: 'Giữ lửa yêu thương bền chặt với **Định Duyên Ngọc** 💍\n\nTìm được nhau đã khó, giữ được nhau càng khó hơn. Tình yêu lâu dài cần sự cam kết và ổn định.\n\n**Định Duyên Ngọc** (Trụ/Viên thạch anh hồng đậm) mang năng lượng của sự gắn kết sâu sắc (Deep bonding). Nó không chỉ là sự rung động nhất thời, mà là sự thấu hiểu và chấp nhận.\n\nĐặt viên đá này trong phòng ngủ giúp neo giữ năng lượng yêu thương, hóa giải những mâu thuẫn vụn vặt thường ngày, để ngôi nhà thực sự là tổ ấm.',
      hashtags: ['#DinhDuyenNgoc', '#ThachAnhHong', '#GiuLuaHanhPhuc', '#GemralLove'],
    },
    {
      content: 'Hiệu ứng cánh bướm trong tâm thức 🦋\n\nMột suy nghĩ tiêu cực nhỏ xíu vào buổi sáng (\'Trời hôm nay chán thế\') có thể dẫn đến một chuỗi sự kiện tồi tệ cả ngày (kẹt xe, trễ làm, sếp mắng, mất tiền...).\n\nNgược lại, một suy nghĩ biết ơn nhỏ xíu (\'Cảm ơn vì mình còn được thở\') có thể mở ra một ngày đầy phép màu.\n\nĐừng coi thường những suy nghĩ nhỏ nhặt. Chúng là hạt mầm của cả khu rừng thực tại bạn đang sống. Hãy canh gác tâm trí mình như người làm vườn canh gác khu vườn khỏi cỏ dại.',
      hashtags: ['#ButterflyEffect', '#Mindfulness', '#GemralStory', '#ChanhNiem'],
    },
    {
      content: 'Tụ tài, Tụ lộc với **KHAY VÀNG DECOR** 🏆\n\nTiền bạc thích sự ngăn nắp và sang trọng. Bạn không thể mời Thần Tài vào một nơi bừa bộn được.\n\n**KHAY VÀNG DECOR** (Làm từ Thạch anh vàng nguyên khối) không chỉ là vật trang trí. Nó là một \'Bát Tụ Bảo\' (Wealth Bowl). Hãy đặt những vật phẩm may mắn, tiền lẻ, hoặc trang sức vào khay này.\n\nNăng lượng của đá thạch anh vàng sẽ \'sạc\' lại năng lượng tài lộc cho những vật phẩm đó, biến chúng thành nam châm hút tiền cho bạn.',
      hashtags: ['#KhayVangDecor', '#BatTuBao', '#GemralFengShui', '#HutLoc'],
    },
    {
      content: 'Nâng cấp nghi thức với **7 RITUAL - NGHI LỄ CHIÊU CẢM ĐIỀU TỐT ĐẸP** 🕯️\n\nBạn có đá, có nến, có trầm... nhưng chưa biết kết hợp sao cho đúng bài bản? Làm lung tung thì năng lượng bị tán loạn.\n\nEbook **7 RITUAL** này là bí kíp đúc kết những nghi thức mạnh mẽ nhất nhưng dễ thực hiện nhất: Từ nghi thức tắm trăng, thanh tẩy ví tiền, đến thiền định kết nối Higher Self.\n\nNghi lễ (Ritual) là cách chúng ta ra hiệu lệnh trang trọng nhất gửi tới Vũ trụ. Hãy làm nó với sự tôn nghiêm và chuẩn chỉnh.',
      hashtags: ['#7Rituals', '#EbookTamLinh', '#GemralTools', '#NghiThuc'],
    },
    {
      content: 'Kiềng ba chân của sự giàu có: **Tam Hoàng Kim Trụ** 🏛️\n\nGiàu có bền vững cần 3 yếu tố: Kiếm được tiền (Năng lực) - Giữ được tiền (Quản lý) - Nhân được tiền (Đầu tư).\n\n**Tam Hoàng Kim Trụ** (Bộ 3 trụ thạch anh vàng) đại diện cho 3 trụ cột này. Khi đặt bộ này ở cung Tài lộc, nó tạo ra thế vững chãi, không bị lung lay.\n\nNếu bạn thấy mình kiếm được nhiều nhưng không giữ được bao nhiêu, có thể \'chân kiềng\' năng lượng của bạn đang bị khập khiễng. Hãy cân bằng lại ngay!',
      hashtags: ['#TamHoangKimTru', '#ThachAnhVang', '#WealthPillars', '#GemralFinance'],
    },
    {
      content: 'Bạn không cần phải \'sửa chữa\' bản thân, vì bạn không hề hỏng hóc.\n\nNhiều người đến với tâm linh với tâm thế \'Tôi đầy lỗi lầm, tôi cần sửa chữa\'. Sai rồi! Bản chất bạn là hoàn hảo, là ánh sáng. Những nỗi sợ, tổn thương chỉ là bụi bẩn bám bên ngoài thôi.\n\nCông việc của chúng ta không phải là sửa cái bóng đèn, mà là lau sạch lớp bụi để ánh sáng bên trong được tỏa ra. Hãy nhẹ nhàng với chính mình. Bạn vốn dĩ đã trọn vẹn.',
      hashtags: ['#YouAreWhole', '#SelfAcceptance', '#GemralSoul', '#ChanNga'],
    },
    {
      content: 'Gia tăng tần số rung động của ngôi nhà với **Cụm Thạch Anh Vàng - Kim Linh Thạch** 🌟\n\nNhà không chỉ là nơi để ở, nhà là trạm sạc năng lượng. Nếu về nhà mà thấy mệt hơn, thì phong thủy có vấn đề.\n\n**Kim Linh Thạch** dạng cụm với vô số tinh thể nhỏ phát ra năng lượng dương cực mạnh, giúp xua tan âm khí và sự trì trệ. Đặt nó ở phòng khách để cả gia đình luôn cảm thấy hào hứng, vui vẻ.\n\n\'Gia hòa vạn sự hưng\' - Năng lượng trong nhà tốt thì mọi việc bên ngoài tự nhiên hanh thông.',
      hashtags: ['#KimLinhThach', '#NangLuongDuong', '#GemralHome', '#PhongThuyNhaO'],
    },
    {
      content: 'Visualisation kết hợp Xúc giác (Feeling the texture) 👋\n\nKhi hình dung về chiếc xe mới, đừng chỉ nhìn thấy nó. Hãy tưởng tượng bạn đang chạm tay vào vô lăng bọc da. Nó mát lạnh hay ấm áp? Nó trơn láng hay sần sùi?\n\nKhi hình dung về cọc tiền, hãy tưởng tượng mùi giấy mới, tiếng sột soạt khi đếm...\n\nKích hoạt xúc giác trong tâm trí làm cho trải nghiệm trở nên \'thật\' hơn gấp 10 lần. Và tiềm thức thì không phân biệt được thật và tưởng tượng. Hãy đánh lừa nó để nó mang điều đó đến cho bạn!',
      hashtags: ['#SensoryVisualization', '#KyThuatHinhDung', '#GemralTips', '#CamGiacThat'],
    },
  ],
  education: [
    {
      content: 'Mới đăng ký gói Starter 299K của Gem Academy mà bất ngờ quá. Tưởng chỉ có khóa Basic Course Trading thôi, ai ngờ được dùng thử Pattern Scanner 5 lần/ngày. Với newbie như mình thì công cụ này như \'phao cứu sinh\' vậy, đỡ phải căng mắt soi chart cả ngày.',
      hashtags: ['#GemAcademy', '#FrequencyTrading', '#StarterPack'],
    },
    {
      content: 'Có ai học khóa \'7 Ngày Khai Mở Tần Số Gốc\' chưa ạ? Mình đang bị tắc nghẽn năng lượng, làm gì cũng thấy không thông. Nghe bảo khóa này giúp reset lại tần số rung động gốc rễ, giá 1tr990 cũng hợp lý. Cho mình xin review với!',
      hashtags: ['#TansoGoc', '#GemAcademy', '#healing'],
    },
    {
      content: 'Review thật lòng về Phương Pháp Giao Dịch Tần Số (Frequency Trading) của Gem: Khác hẳn PTKT truyền thống. Thay vì chỉ nhìn nến, mình học cách cảm nhận nhịp điệu và tần số của thị trường. Hơi trừu tượng lúc đầu nhưng khi bắt được \'sóng\' rồi thì trade nhàn hơn hẳn.',
      hashtags: ['#FrequencyTrading', '#GemTrading', '#trainghiem'],
    },
    {
      content: 'Vừa học xong bài \'Tái Tạo Tư Duy Triệu Phú\' (giá 499k). Thề là nó đả thông tư tưởng kinh khủng. Trước giờ mình cứ nghĩ kiếm tiền khó, hóa ra là do cài đặt tâm thức sai lầm về sự giàu có. Highly recommend cho bác nào đang struggle về tài chính.',
      hashtags: ['#Tuduytrieuphu', '#mindset', '#GemAcademy'],
    },
    {
      content: 'Hôm nay dùng Chatbot của Gem Trading để check tín hiệu, nhạy phết các bác ạ. Mình đang dùng gói Tier 1, được free Chatbot 12 tháng tính ra quá hời so với mua lẻ. Ai trade bận rộn thì nên cân nhắc nha.',
      hashtags: ['#ChatbotGem', '#tradingtools', '#Tier1'],
    },
    {
      content: 'Mọi người ơi, khóa \'Kích Hoạt Tần Số Tình Yêu\' 399k có dành cho người độc thân không hay chỉ cho cặp đôi? Mình muốn học để yêu bản thân hơn trước khi tìm kiếm mối quan hệ mới.',
      hashtags: ['#Tansotinhyeu', '#selflove', '#hoidap'],
    },
    {
      content: 'Quyết định nâng cấp lên Tier 2 của Gem Academy. Lý do đơn giản là cái Pattern Scanner. Gói này được scan 1.997K lần trong 12 tháng, tha hồ lọc tín hiệu. Đầu tư cho công cụ kiếm tiền thì không bao giờ lỗ.',
      hashtags: ['#Tier2', '#PatternScanner', '#dau tu'],
    },
    {
      content: 'Thích nhất ở Gem Academy là cái Forum Access trong gói Starter. Vào đó toàn anh em cùng tần số, chia sẻ kiến thức Frequency Trading văn minh, không toxic như mấy group phím hàng ngoài kia.',
      hashtags: ['#community', '#Gemral', '#Starter'],
    },
    {
      content: 'Chia sẻ kinh nghiệm học \'7 Ngày Khai Mở Tần Số Gốc\': Đừng học lướt. Mỗi ngày học 1 bài và thực hành thiền đi kèm. Đến ngày thứ 3 là mình đã thấy năng lượng thay đổi rõ rệt, nhẹ nhõm hẳn.',
      hashtags: ['#thuchanh', '#tansogoc', '#GemAcademy'],
    },
    {
      content: 'Tại sao lại gọi là Giao Dịch Tần Số? Sau khi học khóa của Gem mới hiểu: Mọi thứ đều là năng lượng. Chart cũng là biểu hiện của sóng năng lượng. Hiểu được tần số thì không cần fomo nữa.',
      hashtags: ['#kienthuc', '#FrequencyTrading', '#GiaoDichTanSo'],
    },
    {
      content: 'Ai đang phân vân gói Tier 3 (68 triệu) thì mình confirm là \'đắt xắt ra miếng\' nhé. Chatbot UNLIMITED 24 tháng + Scanner dùng tẹt ga. Dành cho ai xác định trade full-time và muốn đi đường dài với nghề.',
      hashtags: ['#Tier3', '#fulltimetrader', '#GemTrading'],
    },
    {
      content: 'Combo 2 khóa \'Tái Tạo Tư Duy Triệu Phú\' + \'Kích Hoạt Tần Số Tình Yêu\' chưa đến 1 triệu mà giá trị nhận được lớn quá. Vừa thông tuệ tài chính, vừa an yên trong tâm hồn. Cảm ơn Gem Academy.',
      hashtags: ['#combo', '#tuduy', '#healing'],
    },
    {
      content: 'Cái hay của Pattern Scanner bên Gem là nó lọc nhiễu cực tốt theo phương pháp tần số độc quyền. Mình test thử gói Starter 299k thấy ổn quá chắc phải up lên Tier 1 sớm thôi.',
      hashtags: ['#Scanner', '#congcu', '#trading'],
    },
    {
      content: 'Học trading ở đâu không biết chứ ở Gem Academy là học cả đạo nữa. Phương pháp Frequency Trading dạy mình kiên nhẫn, chờ đợi đúng tần số mới vào lệnh, chứ không phải cắm đầu vào lệnh bừa bãi.',
      hashtags: ['#mindset', '#trading', '#GemAcademy'],
    },
    {
      content: 'Có ai như mình không, học khóa \'Kích Hoạt Tần Số Tình Yêu\' (399k) xong tự nhiên thấy các mối quan hệ xung quanh tốt lên hẳn? Không phải do người ta thay đổi, mà do tần số của mình phát ra đã khác rồi.',
      hashtags: ['#tansotinhyeu', '#thaydoi', '#phep mau'],
    },
    {
      content: 'Góc thắc mắc: Gói Tier 1 (11 triệu) với Tier 2 (21 triệu) khác nhau chủ yếu ở số lượng lượt quét của Scanner đúng không ạ? Mình trade khung H4 thì Tier 1 có đủ dùng không?',
      hashtags: ['#hoidap', '#Tier1', '#Tier2'],
    },
    {
      content: 'Đừng coi thường khóa 499k \'Tái Tạo Tư Duy Triệu Phú\'. Nó không dạy bạn cách kiếm tiền nhanh, nhưng nó gỡ bỏ những \'cục đá\' cản trở dòng tiền trong tâm thức bạn. Cái này quan trọng hơn kỹ năng.',
      hashtags: ['#wealthmindset', '#tamthuc', '#GemAcademy'],
    },
    {
      content: 'Hôm nay thị trường biến động mạnh, nhờ có Chatbot của Gem báo tín hiệu sớm mà mình tránh được cú sập. Công nhận công nghệ kết hợp với phương pháp Tần số hiệu quả thật.',
      hashtags: ['#Chatbot', '#quanlyrui', '#FrequencyTrading'],
    },
    {
      content: 'Bạn nào mới tập tành tìm hiểu Frequency Trading thì cứ mạnh dạn quất gói Starter 299k nhé. Giá bằng mấy ly trà sữa mà được access vào kho kiến thức nền tảng + tool xịn. Quá hời!',
      hashtags: ['#newbie', '#starter', '#recommend'],
    },
    {
      content: 'Hành trình 7 ngày với khóa \'Khai Mở Tần Số Gốc\' đã giúp mình tìm lại được sự cân bằng. Cảm giác như được tắm rửa sạch sẽ tâm hồn vậy. 1tr990 là khoản đầu tư xứng đáng nhất cho bản thân năm nay.',
      hashtags: ['#review', '#tansogoc', '#chualanh'],
    },
    {
      content: 'Điểm khác biệt lớn nhất của Gem Trading là không dạy indicators lằng nhằng. Chỉ tập trung vào Tần Số và Cấu Trúc. Đơn giản nhưng sâu sắc.',
      hashtags: ['#simple', '#tradingmethod', '#GemAcademy'],
    },
    {
      content: 'Mọi người cho mình hỏi, mua gói Tier 3 (68 triệu) có được support 1-1 không? Mình muốn đi chuyên sâu về Frequency Trading để làm nghề tay phải.',
      hashtags: ['#Tier3', '#career', '#hoidap'],
    },
    {
      content: 'Vừa học xong bài về \'Luật hấp dẫn trong tài chính\' thuộc khóa Tư Duy Triệu Phú. Hóa ra trước giờ mình toàn đẩy tiền ra xa bằng nỗi sợ hãi. Giờ phải thực hành hút tiền lại thôi!',
      hashtags: ['#lawofattraction', '#money', '#GemAcademy'],
    },
    {
      content: 'Scanner của Gem Academy có quét được mô hình Harmonic không các bác? Em đang dùng gói Starter thấy chủ yếu báo mô hình nến đảo chiều theo tần số.',
      hashtags: ['#patternscanner', '#hoidap', '#kythuat'],
    },
    {
      content: 'Nếu bạn đang gặp trục trặc trong tình cảm, hãy thử khóa \'Kích Hoạt Tần Số Tình Yêu\'. Chỉ 399k thôi nhưng nó giúp mình nhận ra mình phải yêu bản thân đủ đầy thì mới thu hút được tình yêu chất lượng.',
      hashtags: ['#lovefrequency', '#healing', '#relationship'],
    },
    {
      content: 'Tier 2 (21 triệu) là best choice cho anh em swing trader. Lượng scan vừa đủ, chatbot free 12 tháng. Tính ra chi phí vận hành mỗi tháng quá rẻ cho bộ tool độc quyền này.',
      hashtags: ['#swingtrade', '#Tier2', '#review'],
    },
    {
      content: 'Cảnh báo: Học Frequency Trading xong bị nghiện đấy :)) Nhìn đâu cũng thấy sóng và tần số. Nhưng mà nghiện này ra tiền nên cũng được.',
      hashtags: ['#funny', '#tradinglife', '#GemAcademy'],
    },
    {
      content: 'Khóa \'7 Ngày Khai Mở Tần Số Gốc\' không chỉ là lý thuyết suông. Nó có bài tập thực hành cụ thể từng ngày để nâng cao rung động. Học xong thấy người nhẹ nhõm, may mắn tự nhiên tới.',
      hashtags: ['#lucky', '#vibration', '#tansogoc'],
    },
    {
      content: 'Cảm ơn Gem Academy đã tạo ra gói Starter 299k. Nhờ nó mà sinh viên nghèo như em cũng được tiếp cận kiến thức trading xịn sò và công cụ Scanner.',
      hashtags: ['#student', '#camon', '#opportunity'],
    },
    {
      content: 'Chatbot của Gem không chỉ bắn tín hiệu, nó còn nhắc nhở kỷ luật. Nhiều lúc định fomo mà thấy Bot không báo là lại rụt tay lại. Đúng là trợ lý đắc lực.',
      hashtags: ['#discipline', '#chatbot', '#tradingassistant'],
    },
    {
      content: 'Ai học \'Tái Tạo Tư Duy Triệu Phú\' rồi cho mình hỏi, phần cài đặt lại tiềm thức có khó không? Mình hay bị suy nghĩ tiêu cực lấn át.',
      hashtags: ['#tiemthuc', '#tuduy', '#hoidap'],
    },
    {
      content: 'Đầu tư cho tri thức không bao giờ lỗ. Vừa quất combo Tier 1 + Khóa Tần Số Gốc. Chuẩn bị hành trang kỹ lưỡng để chiến đấu với market.',
      hashtags: ['#investment', '#ready', '#GemAcademy'],
    },
    {
      content: 'Phương pháp Frequency Trading của Gem giải thích rất hay về vùng hợp lưu năng lượng. Khi giá, thời gian và tần số gặp nhau, đó là điểm vào lệnh hoàn hảo.',
      hashtags: ['#confluence', '#tradingstrategy', '#GemTrading'],
    },
    {
      content: 'Review khóa \'Kích Hoạt Tần Số Tình Yêu\': Không chỉ là tình yêu đôi lứa, khóa học giúp mình hàn gắn mối quan hệ với bố mẹ. Năng lượng chữa lành cực mạnh.',
      hashtags: ['#family', '#healing', '#review'],
    },
    {
      content: 'Gói Tier 3 tuy giá 68 triệu nhưng tính ra được dùng Scanner và Chatbot Unlimited tận 2 năm. Chia ra mỗi tháng chưa đến 3 triệu cho bộ công cụ kiếm tiền tỷ. Tư duy đầu tư là đây chứ đâu.',
      hashtags: ['#Tier3', '#businessmindset', '#roi'],
    },
    {
      content: 'Lưu ý cho anh em mới vào Forum của gói Starter: Hãy đọc kỹ nội quy và chịu khó lục lại các bài ghim về Frequency Trading cơ bản trước khi hỏi nhé. Kiến thức trong đó là kho báu đấy.',
      hashtags: ['#forumtips', '#selfstudy', '#GemAcademy'],
    },
    {
      content: 'Mình đã học qua nhiều khóa trading bên ngoài, nhưng khóa của Gem Academy mang lại cảm giác khác biệt nhất. Nó không khô khan mà rất \'tâm linh\' theo hướng khoa học năng lượng.',
      hashtags: ['#unique', '#science', '#spiritualtrading'],
    },
    {
      content: '499k cho một tấm vé thay đổi tư duy tài chính vĩnh viễn với \'Tái Tạo Tư Duy Triệu Phú\'. Quá rẻ cho một cuộc đời thịnh vượng. Ai chưa học thì đăng ký ngay đi.',
      hashtags: ['#mustlearn', '#wealth', '#GemAcademy'],
    },
    {
      content: 'Scanner của Gem Academy chạy trên nền tảng web hay app vậy mọi người? Gói Starter 5 lượt/ngày có được cộng dồn nếu không dùng hết không?',
      hashtags: ['#techsupport', '#hoidap', '#Scanner'],
    },
    {
      content: 'Từ lúc học \'7 Ngày Khai Mở Tần Số Gốc\', mình tập được thói quen quan sát tâm trí. Nhờ vậy mà khi trade, mình nhận diện được tham-sân-si nhanh hơn để cắt lỗ kịp thời.',
      hashtags: ['#mindfulness', '#tradingpsychology', '#tansogoc'],
    },
    {
      content: 'Mọi người ơi, Chatbot trong gói Tier 2 có cài đặt thông báo về điện thoại được không? Mình hay phải ra ngoài, sợ lỡ kèo ngon.',
      hashtags: ['#chatbot', '#notification', '#Tier2'],
    },
    {
      content: 'Thích cái cách Gem Academy phân cấp sản phẩm. 299k cho người mới trải nghiệm, các gói Tier cao cho dân chuyên. Ai cũng có cơ hội tiếp cận Frequency Trading.',
      hashtags: ['#access', '#pricing', '#GemTrading'],
    },
    {
      content: 'Học \'Kích Hoạt Tần Số Tình Yêu\' xong thấy mình đẹp lên hẳn (tâm sinh tướng mà lị). Tự tin, vui vẻ thì tự nhiên thu hút những điều tốt đẹp thôi.',
      hashtags: ['#beauty', '#vibes', '#love'],
    },
    {
      content: 'Anh em nào dùng Scanner của Gem rồi cho mình xin feedback độ chính xác với? Đang định xuống tiền gói Tier 1 (11 củ) mà vẫn hơi lăn tăn.',
      hashtags: ['#feedback', '#scanner', '#Tier1'],
    },
    {
      content: 'Tư duy triệu phú không phải là có 1 triệu đô trong tay, mà là có tư duy tạo ra 1 triệu đô bất kể hoàn cảnh. Khóa học 499k của Gem đã dạy mình điều đó.',
      hashtags: ['#mindsetshift', '#tuduy', '#GemAcademy'],
    },
    {
      content: 'Gem Academy có chính sách nâng cấp gói không nhỉ? Ví dụ đang dùng Starter muốn lên Tier 2 thì có được trừ tiền gói cũ không? Admin trả lời giúp em với.',
      hashtags: ['#support', '#upgrade', '#policy'],
    },
    {
      content: 'Kết hợp thiền \'Tần Số Gốc\' trước giờ giao dịch phiên Mỹ là thói quen mới của mình. Tâm tĩnh, nhìn chart sáng, vào lệnh chuẩn. Combo hoàn hảo.',
      hashtags: ['#tradingroutine', '#meditation', '#tansogoc'],
    },
    {
      content: 'Chatbot Unlimited trong gói Tier 3 đúng là \'hack game\'. Nó quét thị trường 24/7, không bỏ lỡ nhịp nào. Tiền nào của nấy thật sự.',
      hashtags: ['#unlimited', '#chatbot', '#Tier3'],
    },
    {
      content: 'Đừng đợi giàu mới học tư duy triệu phú. Hãy học tư duy triệu phú để trở nên giàu có. Khóa học 499k của Gem là bước đệm tuyệt vời.',
      hashtags: ['#startnow', '#wealthcreation', '#education'],
    },
    {
      content: 'Phương pháp Frequency Trading độc quyền của Gem giúp mình hiểu rằng: Thị trường không chạy ngẫu nhiên, nó chạy theo quy luật của năng lượng. Khai sáng thực sự!',
      hashtags: ['#enlightenment', '#trading', '#GemAcademy'],
    },
    {
      content: 'Gói Starter 299K nhưng giá trị nhận lại phải tiền triệu. Được học basic, được vào forum chất lượng, lại còn được dùng tool. Gem Academy chơi đẹp quá.',
      hashtags: ['#value', '#community', '#Starter'],
    },
    {
      content: 'Khóa \'7 Ngày Khai Mở Tần Số Gốc\' giúp mình chữa lành những tổn thương tài chính trong quá khứ. Giờ trade với tâm thế bình an hơn nhiều, không còn cay cú với thị trường.',
      hashtags: ['#healingmoneywounds', '#tansogoc', '#trading'],
    },
    {
      content: 'Ai bảo 399k không mua được hạnh phúc? Mua khóa \'Kích Hoạt Tần Số Tình Yêu\' đi rồi biết hạnh phúc tự thân là như thế nào nhé.',
      hashtags: ['#happiness', '#selflove', '#GemAcademy'],
    },
    {
      content: 'Có ai dùng Scanner của Gem để trade vàng (Gold) không? Thấy nó bắt sóng vàng nhạy cực. Chia sẻ setup cho anh em tham khảo với.',
      hashtags: ['#xauusd', '#gold', '#scanner'],
    },
    {
      content: 'Tier 1 (11 triệu) là khoản đầu tư thông minh cho những ai muốn nghiêm túc với trading trong năm nay. 1 năm dùng Scanner và Chatbot tẹt ga để kiếm lại gấp nhiều lần số đó.',
      hashtags: ['#investsmart', '#Tier1', '#goals'],
    },
    {
      content: 'Càng học Frequency Trading càng thấy sự liên kết chặt chẽ giữa Tâm Thức và Biểu Đồ. Gem Academy đang đi tiên phong trong việc kết hợp hai mảng này.',
      hashtags: ['#pioneer', '#tamthuc', '#trading'],
    },
    {
      content: 'Mới hoàn thành khóa \'Tái Tạo Tư Duy Triệu Phú\'. Bài tập về lòng biết ơn tiền bạc trong khóa học thực sự thay đổi cách mình chi tiêu và quản lý vốn.',
      hashtags: ['#gratitude', '#money', '#tuduy'],
    },
    {
      content: 'Gói Tier 2 (21 triệu) có Scanner xịn hơn Tier 1 ở điểm nào vậy mọi người? Hay chỉ là số lượng quét nhiều hơn thôi? Cần tư vấn để xuống tiền.',
      hashtags: ['#advice', '#Tier2', '#GemTrading'],
    },
    {
      content: 'Forum trong gói Starter là nơi lý tưởng để newbie học hỏi. Các admin và member cũ support rất nhiệt tình về phương pháp Giao Dịch Tần Số.',
      hashtags: ['#supportive', '#forum', '#Gemral'],
    },
    {
      content: 'Khóa \'7 Ngày Khai Mở Tần Số Gốc\' (1tr990) không chỉ dành cho trader đâu. Bất cứ ai muốn nâng cao chất lượng cuộc sống, thu hút may mắn đều nên học.',
      hashtags: ['#lifestyle', '#luck', '#GemAcademy'],
    },
    {
      content: 'Chatbot của Gem báo kèo chuẩn, nhưng quan trọng là mình phải có kiến thức nền tảng từ khóa học để lọc lại và quản lý vốn. Tool hỗ trợ, người quyết định.',
      hashtags: ['#skill', '#tools', '#responsibility'],
    },
    {
      content: 'Đang phân vân không biết nên học khóa Tư Duy nào trước trong bộ 3 khóa của Gem. Mọi người cho lời khuyên với? Mình đang gặp vấn đề cả về tiền bạc lẫn tình cảm.',
      hashtags: ['#advice', '#mindsetcourses', '#help'],
    },
    {
      content: 'Frequency Trading không phải chén thánh, nhưng nó là tấm bản đồ năng lượng giúp bạn không bị lạc lối giữa rừng nến. Cảm ơn Gem Academy đã phổ cập phương pháp này.',
      hashtags: ['#roadmap', '#trading', '#GemAcademy'],
    },
    {
      content: 'Gói Tier 3 (68 triệu) - Con đường ngắn nhất để trở thành Pro Trader với sự hỗ trợ tận răng của công nghệ. Đầu tư một lần, hưởng lợi 2 năm.',
      hashtags: ['#protrader', '#Tier3', '#longterm'],
    },
    {
      content: 'Học \'Kích Hoạt Tần Số Tình Yêu\' xong mới hiểu: Tần số của bạn quyết định người bạn gặp. Muốn gặp người tuyệt vời, hãy nâng tần số của mình lên trước.',
      hashtags: ['#lawofattraction', '#love', '#GemAcademy'],
    },
    {
      content: 'Scanner 5 lần/ngày của gói Starter (299k) là quá đủ cho những ai trade khung ngày (D1) như mình. Sáng dậy quét một lượt, đặt lệnh rồi đi làm. Thảnh thơi.',
      hashtags: ['#daytrading', '#starter', '#efficiency'],
    },
    {
      content: 'Khóa \'Tái Tạo Tư Duy Triệu Phú\' giúp mình phá bỏ niềm tin giới hạn \'người giàu là người xấu\'. Giờ thì thoải mái kiếm tiền và làm giàu chính đáng thôi!',
      hashtags: ['#limitingbeliefs', '#wealth', '#freedom'],
    },
    {
      content: 'Chatbot của gói Tier 1 có báo tín hiệu Crypto không hay chỉ Forex vậy các bác? Mình chủ yếu trade Coin.',
      hashtags: ['#crypto', '#chatbot', '#hoidap'],
    },
    {
      content: '7 ngày để thay đổi cuộc đời với \'Khai Mở Tần Số Gốc\'. Nghe có vẻ quảng cáo nhưng học rồi mới thấy nó tác động sâu vào tiềm thức thế nào. Rất đáng thử.',
      hashtags: ['#subconscious', '#change', '#GemAcademy'],
    },
    {
      content: 'Phương pháp Giao Dịch Tần Số của Gem giúp mình nhìn ra những vùng \'bẫy giá\' mà trước đây toàn dính chấu. Kiến thức này cứu rỗi tài khoản của mình bao lần.',
      hashtags: ['#traps', '#tradingwisdom', '#FrequencyTrading'],
    },
    {
      content: 'Gói Tier 2 (21 triệu) tặng kèm Chatbot trị giá 99k/tháng trong 1 năm. Combo này tối ưu hóa lợi nhuận cực tốt cho anh em trader bán chuyên.',
      hashtags: ['#optimization', '#Tier2', '#profit'],
    },
    {
      content: 'Đừng chỉ học kỹ thuật, hãy học cả tư duy. Bộ 3 khóa học Mindset của Gem Academy là nền tảng vững chắc trước khi bạn bước vào thị trường tài chính khốc liệt.',
      hashtags: ['#foundation', '#mindset', '#GemAcademy'],
    },
    {
      content: 'Cộng đồng trong gói Starter 299k hoạt động sôi nổi ghê. Sáng nào cũng có bài phân tích thị trường theo hệ Tần Số. Học thầy không tày học bạn mà.',
      hashtags: ['#learning', '#community', '#starter'],
    },
    {
      content: 'Ai muốn chữa lành mối quan hệ với tiền bạc thì học ngay \'Tái Tạo Tư Duy Triệu Phú\' (499k) nhé. Tiền là năng lượng, phải yêu tiền thì tiền mới tới.',
      hashtags: ['#moneyenergy', '#tuduy', '#GemAcademy'],
    },
    {
      content: 'Scanner của Gem Academy có backtest được không nhỉ? Mình muốn kiểm tra độ hiệu quả của các mô hình tần số trong quá khứ.',
      hashtags: ['#backtest', '#scanner', '#question'],
    },
    {
      content: 'Gói Tier 3 (68 triệu) là sự cam kết nghiêm túc với nghề trading. 24 tháng đồng hành cùng công nghệ đỉnh cao của Gem. Chờ ngày hái quả ngọt.',
      hashtags: ['#commitment', '#Tier3', '#success'],
    },
    {
      content: 'Khóa \'Kích Hoạt Tần Số Tình Yêu\' 399k ngắn gọn, súc tích nhưng chạm đúng điểm đau. Học xong thấy nhẹ lòng, sẵn sàng mở cửa trái tim lần nữa.',
      hashtags: ['#heartopening', '#love', '#healing'],
    },
    {
      content: 'Frequency Trading không phải là đoán mò. Nó là khoa học về xác suất thống kê dựa trên năng lượng. Gem Academy đã hệ thống hóa nó rất bài bản.',
      hashtags: ['#probability', '#science', '#GemTrading'],
    },
    {
      content: 'Dùng thử gói Starter 299k thấy ưng cái bụng quá. Chắc chắn sẽ giới thiệu cho bạn bè. Kiến thức chất lượng, giá sinh viên.',
      hashtags: ['#recommendation', '#starter', '#gooddeal'],
    },
    {
      content: 'Khóa \'7 Ngày Khai Mở Tần Số Gốc\' giúp mình ngủ ngon hơn hẳn. Năng lượng xấu được giải phóng, tâm trí bình yên. Sức khỏe cũng cải thiện theo.',
      hashtags: ['#sleepbetter', '#health', '#tansogoc'],
    },
    {
      content: 'Anh em nào đang học Tier 2 của Gem Trading chắc mê nhất bộ 6 công thức Frequency độc quyền nhỉ? Cá nhân mình thấy cái HFZ (High Frequency Zones) và LFZ bắt đỉnh đáy cực khét. Đúng là bỏ 21 triệu ra đáng đồng tiền bát gạo.',
      hashtags: ['#Tier2', '#HFZ', '#FrequencyTrading', '#GemAcademy'],
    },
    {
      content: 'Vừa nâng cấp lên Tier 3: Đế Chế Trader Bậc Thầy. Cái giá 68 triệu nghe thì to nhưng được access vào Whale Tracker & Dashboard soi on-chain thì quá hời. Nhìn thấy ví cá voi di chuyển tiền realtime giúp mình tự tin gồng lãi hẳn.',
      hashtags: ['#Tier3', '#WhaleTracker', '#OnChain', '#GemTrading'],
    },
    {
      content: 'Có bác nào dùng AI Prediction Tool trong gói Tier 3 chưa? Nghe bảo độ chính xác lên tới 73% nhờ Machine Learning. Công nghệ giờ hỗ trợ trader tận răng thế này bảo sao win rate của Tier 3 toàn 80-90%.',
      hashtags: ['#AI', '#Technology', '#TradingTool', '#Tier3'],
    },
    {
      content: 'Học xong 5 modules của gói Tier 1 (11 triệu) thấy nền tảng vững hơn hẳn. Tuy chỉ có 7 patterns cơ bản nhưng nếu kỷ luật thì Win rate 50-55% là trong tầm tay. Khởi đầu như vậy là quá ổn cho newbie.',
      hashtags: ['#Tier1', '#Nentang', '#BasicTrading', '#GemAcademy'],
    },
    {
      content: 'Bí mật của Tier 2 nằm ở 4 công thức DPD, UPU, UPD, DPU. Trước giờ trade theo cảm tính toàn bị quét stoploss, giờ áp dụng công thức vào thấy chart chạy mượt như tranh vẽ. Win rate lên 70% không phải là chém gió.',
      hashtags: ['#congthuc', '#DPD', '#UPU', '#Tier2'],
    },
    {
      content: 'Review nhóm Mastermind Elite (chỉ dành cho Tier 3): Không khí học tập khác hẳn bên ngoài. Được call trực tiếp hàng tuần, chia sẻ idea real-time với các \'tay to\'. Đúng là môi trường tạo nên đẳng cấp.',
      hashtags: ['#Mastermind', '#Elite', '#Networking', '#GemAcademy'],
    },
    {
      content: 'Tại sao 78% học viên chọn Tier 2? Vì nó cân bằng nhất: 8 Tools chuyên nghiệp (có cả Sentiment Analyzer) + 6 công thức độc quyền. Với mức giá 21 triệu thì ROI (hoàn vốn) sau 3-6 tháng là hoàn toàn khả thi.',
      hashtags: ['#BestChoice', '#Tier2', '#Investment', '#GemTrading'],
    },
    {
      content: 'Đừng chỉ học kỹ thuật, hãy học cách xây dựng di sản. Phần \'Triết Lý Bậc Thầy\' trong Tier 3 dạy về Empire Building Framework đã thay đổi hoàn toàn tư duy của mình từ một con buôn sang một nhà đầu tư thực thụ.',
      hashtags: ['#EmpireBuilder', '#Mindset', '#Tier3', '#Legacy'],
    },
    {
      content: 'Mới xúc gói Starter 299k để test thử cái Basic Pattern Scanner. Quét được 7 mẫu hình cơ bản, đủ dùng cho anh em vốn nhỏ tập tành. Gem Academy tạo điều kiện cho người mới tốt thật.',
      hashtags: ['#Starter', '#TestDrive', '#Scanner'],
    },
    {
      content: 'Sự khác biệt giữa Tier 2 và Tier 3 là bộ Data Feeds trị giá 12.600$/năm. Được nhìn thấy Level 2 Order Book (tường mua bán) giúp mình tránh được bao nhiêu cú \'úp bô\' của thị trường. Tier 3 đúng là vũ khí hạng nặng.',
      hashtags: ['#DataFeeds', '#Level2', '#Tier3', '#ProTrader'],
    },
    {
      content: 'Kết hợp khóa \'7 Ngày Khai Mở Tần Số Gốc\' (1tr990) trước khi vào lệnh theo hệ thống Frequency Trading là combo hủy diệt. Tâm an, trí sáng, nhìn đâu cũng thấy cơ hội.',
      hashtags: ['#TansoGoc', '#MindsetTrading', '#Combo'],
    },
    {
      content: 'Tier 2 cung cấp công cụ \'Position Size Calculator\' tính toán rủi ro cực chuẩn. Học trading mà không biết quản lý vốn thì công thức hay đến mấy cũng cháy. Gem Academy dạy kỹ phần này lắm.',
      hashtags: ['#RiskManagement', '#Tier2', '#Tools'],
    },
    {
      content: 'Mình thích cái \'5-layer confluence framework\' trong Tier 2. Phải hội tụ đủ 5 yếu tố mới vào lệnh. Kỷ luật như thế bảo sao Win rate không cao.',
      hashtags: ['#Confluence', '#KyLuat', '#Tier2'],
    },
    {
      content: 'Gói Tier 3 có cái \'Professional Backtesting Engine\' xịn sò thực sự. Cho phép test chiến lược với data 5 năm đổ lại. Backtest nát máy mới dám mang tiền thật vào thị trường chứ.',
      hashtags: ['#Backtest', '#Tier3', '#AnToan'],
    },
    {
      content: 'Ai đang kẹt lệnh hay tâm lý bất ổn thì nên học ngay khóa \'Tái Tạo Tư Duy Triệu Phú\' giá 499k. Nó giúp mình nhận ra những điểm mù trong tư duy về tiền bạc mà trước giờ không để ý.',
      hashtags: ['#Tuduy', '#Taichinh', '#GemAcademy'],
    },
    {
      content: 'Tín hiệu từ Tier 3 không phải là kèo \'xanh chín\'. Mỗi tín hiệu đều kèm phân tích 9 yếu tố (9 factors analysis). Học cách phân tích của chuyên gia qua từng tín hiệu mới là cách học nhanh nhất.',
      hashtags: ['#Signals', '#Analysis', '#Tier3'],
    },
    {
      content: 'Thích cái cách Gem Academy bảo hành trọn đời cho kiến thức. Tier 2 được 12 tháng community, Tier 3 tận 24 tháng. Có chỗ để hỏi han, trao đổi nó yên tâm hẳn.',
      hashtags: ['#Support', '#Community', '#Longterm'],
    },
    {
      content: 'Vừa học xong bài \'Multi-Timeframe Analysis\' trong Tier 2. Trước giờ cứ nhìn M15 trade loạn xạ, giờ biết kết hợp đa khung thời gian thấy bức tranh thị trường rõ ràng hơn nhiều.',
      hashtags: ['#MultiTimeframe', '#Tier2', '#Kienthuc'],
    },
    {
      content: 'Khóa \'Kích Hoạt Tần Số Tình Yêu\' (399k) tuy rẻ nhưng nội dung rất sâu sắc. Áp dụng luật hấp dẫn để yêu thương bản thân và thu hút những mối quan hệ chất lượng. Highly recommend!',
      hashtags: ['#LoveFrequency', '#Healing', '#GemAcademy'],
    },
    {
      content: 'Cảnh báo: Đừng nhảy vào Tier 3 nếu bạn chưa xác định coi trading là sự nghiệp (Career). Tier 3 là để xây dựng đế chế, không phải để chơi cho vui. Cần mindset nghiêm túc.',
      hashtags: ['#Serious', '#CareerPath', '#Tier3'],
    },
    {
      content: 'Công thức LFZ (Low Frequency Zones) trong Tier 2 giúp mình bắt được những vùng giá tích lũy mà cá mập đang gom hàng. Đi theo dấu chân người khổng lồ bao giờ cũng an toàn hơn.',
      hashtags: ['#LFZ', '#SmartMoney', '#Tier2'],
    },
    {
      content: 'Hỗ trợ ưu tiên 4h của Tier 3 quá đỉnh. Gặp lỗi phát nhắn support là được giải quyết ngay trong buổi. Dịch vụ VIP đúng nghĩa.',
      hashtags: ['#PrioritySupport', '#VIP', '#Tier3'],
    },
    {
      content: 'Công thức DPD (Down-Pause-Down) trong Tier 2 đúng là khắc tinh của thị trường Bear. Nhờ nó mà mình không còn \'bắt dao rơi\' nữa, cứ đợi đúng nhịp Pause rồi vào lệnh Short, an toàn hơn hẳn.',
      hashtags: ['#DPD', '#BearMarket', '#Tier2', '#GemTrading'],
    },
    {
      content: 'Nhiều người hỏi tại sao phải học \'Tái Tạo Tư Duy Triệu Phú\' (499k) trước khi học Trading? Đơn giản thôi, nếu \'nhiệt kế tài chính\' trong tâm thức bạn chỉ ở mức 10 triệu, thì dù market có cho bạn 1 tỷ, bạn cũng sẽ tìm cách đánh mất nó thôi.',
      hashtags: ['#financialthermostat', '#mindset', '#GemAcademy'],
    },
    {
      content: 'Tier 3 không chỉ dạy trade, nó dạy cách xây dựng \'Đế Chế\'. Cái Empire Building Framework đã mở mắt cho mình thấy trading có thể scale up thành một quỹ đầu tư cá nhân bài bản như thế nào.',
      hashtags: ['#EmpireBuilding', '#BusinessMindset', '#Tier3'],
    },
    {
      content: 'Dùng thử cái \'Sentiment Analyzer\' (Phân tích tâm lý thị trường) trong bộ tool của Tier 2 thấy hay phết. Nó đo lường được sự sợ hãi/tham lam của đám đông để mình đi ngược lại. Warren Buffett bảo rồi: Tham lam khi người khác sợ hãi.',
      hashtags: ['#SentimentAnalysis', '#Contrarian', '#Tier2'],
    },
    {
      content: 'Với mức ROI kỳ vọng 20-30%/năm của gói Tier 1, mình thấy rất thực tế và bền vững. Ai mới vào nghề đừng mong x10 x100 tài khoản sau một đêm, hãy học cách đi chậm mà chắc với nền tảng vững vàng trước đã.',
      hashtags: ['#RealisticGoals', '#Tier1', '#SustainableTrading'],
    },
    {
      content: 'Khóa \'Kích Hoạt Tần Số Tình Yêu\' 399k giúp mình nhận ra: Mối quan hệ với tiền bạc cũng giống như mối quan hệ với người yêu vậy. Phải trân trọng, yêu thương và không kiểm soát thái quá thì nó mới ở lại với mình.',
      hashtags: ['#MoneyLove', '#Relationship', '#GemAcademy'],
    },
    {
      content: 'Điểm ăn tiền nhất của Tier 3 là được access vào data của Santiment và Glassnode (trị giá hơn 12k$/năm). Dữ liệu on-chain không biết nói dối, nhìn dòng tiền di chuyển là biết xu hướng sắp tới.',
      hashtags: ['#OnChainData', '#WhaleWatching', '#Tier3'],
    },
    {
      content: 'Mình từng bị \'loạn chưởng\' vì học quá nhiều phương pháp trên mạng. Đến khi học Frequency Trading của Gem mới thấy sự tinh gọn. Chỉ cần 6 công thức cốt lõi của Tier 2 là đủ kiếm sống khỏe re.',
      hashtags: ['#TinhGon', '#HieuQua', '#Tier2'],
    },
    {
      content: 'Cảm giác được support ưu tiên trong 4h của gói Tier 3 nó VIP thật sự. Vừa thắc mắc về setup lệnh, nhắn tin cái là có đội ngũ chuyên gia giải đáp cặn kẽ kèm video minh họa. Đáng đồng tiền.',
      hashtags: ['#VIPSupport', '#Tier3', '#CustomerService'],
    },
    {
      content: 'Đang stress vì thua lỗ? Thử ngay khóa \'7 Ngày Khai Mở Tần Số Gốc\'. Bài thiền ngày thứ 4 về \'Buông bỏ chấp niệm\' đã cứu rỗi tâm trí mình khỏi những lệnh thua, giúp mình reset lại trạng thái cân bằng.',
      hashtags: ['#StressRelief', '#TradingPsychology', '#TanSoGoc'],
    },
    {
      content: 'Gói Starter 299k có workbook dày hơn 100 trang, in ra đóng tập học dần cực tiện. Kiến thức basic nhưng rất chuẩn chỉnh, không bị lan man như sách ngoài nhà sách.',
      hashtags: ['#Workbook', '#SelfStudy', '#Starter'],
    },
    {
      content: 'Công thức UPU (Up-Pause-Up) trong Tier 2 đánh trend tăng sướng tê người. Cứ chờ nhịp Pause điều chỉnh xong là múc, tỷ lệ Win cao ngất ngưởng. Anh em nào holder cũng nên học để tối ưu điểm vào.',
      hashtags: ['#UPU', '#TrendTrading', '#Tier2'],
    },
    {
      content: 'Tham gia Mastermind Elite Group của Tier 3 mới thấy tầm quan trọng của network. Được nghe các \'cá mập\' thảo luận về vĩ mô, dòng tiền... tầm nhìn của mình được nâng lên một level mới.',
      hashtags: ['#NetworkIsNetworth', '#Mastermind', '#Tier3'],
    },
    {
      content: 'Có ai dùng \'News & Events Calendar\' của Gem chưa? Nó chấm điểm tác động (impact scoring) của tin tức chuẩn phết. Nhờ đó mà mình biết tin nào nên né, tin nào nên trade.',
      hashtags: ['#NewsTrading', '#Tools', '#GemAcademy'],
    },
    {
      content: 'Học xong \'Tái Tạo Tư Duy Triệu Phú\' mới biết mình từng mắc kẹt trong tư duy \'nạn nhân\'. Lúc nào cũng đổ lỗi cho sàn, cho cá mập. Giờ thì chịu trách nhiệm 100% với túi tiền của mình rồi.',
      hashtags: ['#Ownership', '#Mindset', '#GemAcademy'],
    },
    {
      content: 'Pattern Scanner của gói Tier 1 tuy cơ bản (7 patterns) nhưng lại là những mẫu hình kinh điển nhất như Vai Đầu Vai, 2 Đỉnh 2 Đáy... Luyện thành thục mấy cái này là đủ sống rồi, không cần màu mè.',
      hashtags: ['#ClassicPatterns', '#Tier1', '#BackToBasic'],
    },
    {
      content: 'Mình thích cách Gem Academy tích hợp \'Multi-Timeframe Analysis\' vào tool. Chỉ cần 1 click là thấy xu hướng của H1, H4, D1 đồng bộ với nhau hay không. Tiết kiệm bao nhiêu thời gian soi chart.',
      hashtags: ['#TimeSaving', '#MultiTimeframe', '#TechTrading'],
    },
    {
      content: 'Khóa \'Kích Hoạt Tần Số Tình Yêu\' dạy mình cách yêu thương cả những lệnh thua lỗ. Nghe vô lý nhưng lại rất thuyết phục: Chấp nhận thua lỗ như một phần của cuộc chơi thì tâm mới an để thắng lớn.',
      hashtags: ['#TradingPhilosophy', '#LoveFrequency', '#Acceptance'],
    },
    {
      content: 'Nếu bạn muốn biến trading thành nguồn thu nhập thụ động 2k-8k$/tháng thì lộ trình của Tier 2 là khả thi nhất. Vốn 3k-10k$, kỷ luật theo 6 công thức độc quyền, sau 6 tháng là hái quả.',
      hashtags: ['#PassiveIncome', '#GoalSetting', '#Tier2'],
    },
    {
      content: 'Gói Tier 3 có \'AI Prediction Tool\' dự đoán xu hướng với độ chính xác 73%. Tuy nhiên Gem luôn nhắc nhở: AI chỉ là tham khảo, quyết định cuối cùng vẫn ở trader. Tư duy này rất chuẩn.',
      hashtags: ['#AI', '#HumanVsMachine', '#Tier3'],
    },
    {
      content: 'Có ai đang dùng gói Tier 3 mà mê cái \'Level 2 Order Book\' như mình không? Nhìn thấy tường mua bán (Buy/Sell Walls) chạy realtime giúp mình tránh được bao nhiêu cú \'bull trap\'. Data trị giá 12.000$ nó phải khác bọt thật sự.',
      hashtags: ['#OrderBook', '#Tier3', '#MarketMaker', '#GemTrading'],
    },
    {
      content: 'Hôm nay ngồi cafe backtest lại công thức UPD (Up-Pause-Down) trong khóa Tier 2. Phát hiện ra là nếu kết hợp thêm volume profile thì win rate có thể lên tới 80% ở khung H1. Anh em thử xem sao nhé.',
      hashtags: ['#UPD', '#Backtest', '#Tier2', '#FrequencyTrading'],
    },
    {
      content: 'Khóa \'7 Ngày Khai Mở Tần Số Gốc\' (1tr990) không phải là khóa học làm giàu, mà là khóa học làm \'người\'. Nó giúp mình reset lại hệ điều hành tâm thức, xóa bỏ rác năng lượng để đón nhận sự thịnh vượng một cách tự nhiên.',
      hashtags: ['#Healing', '#Mindset', '#TanSoGoc', '#GemAcademy'],
    },
    {
      content: 'Nhiều bạn hỏi gói Starter 299k có gì? Ngoài khóa học Basic, cái giá trị nhất là được dùng Chatbot 10 lần/ngày. Đủ để check nhanh xu hướng trước khi vào ca làm việc. Quá tiện cho dân văn phòng.',
      hashtags: ['#Starter', '#Chatbot', '#OfficeTrader', '#GemAcademy'],
    },
    {
      content: 'Tư duy \'Đế Chế\' trong Tier 3 không dành cho những ai thích đánh quả lẻ. Nó dạy cách scale vốn, quản lý quỹ và xây dựng team. Học xong thấy mình không còn là trader nữa mà là một fund manager thực thụ.',
      hashtags: ['#FundManager', '#EmpireBuilding', '#Tier3', '#Career'],
    },
    {
      content: 'Vừa múc khóa \'Kích Hoạt Tần Số Tình Yêu\' 399k. Ngắn gọn nhưng thấm. Học xong mới hiểu tại sao mình hay gặp \'red flag\'. Tần số của mình phát ra sự thiếu thốn thì chỉ hút về những người đến để lấy đi thôi.',
      hashtags: ['#LoveFrequency', '#RedFlag', '#SelfWorth', '#GemAcademy'],
    },
    {
      content: 'Sự khác biệt của Tín hiệu (Signals) trong gói Tier 3 là nó có \'Confluence Score\' (Điểm hợp lưu). Tín hiệu nào điểm trên 80/100 là mình tự tin đi volume lớn. Một tính năng nhỏ nhưng cực hữu ích để quản lý vốn.',
      hashtags: ['#ConfluenceScore', '#Signals', '#Tier3', '#RiskManagement'],
    },
    {
      content: 'Học Frequency Trading xong nhìn đâu cũng thấy cơ hội. Nhưng khóa \'Tái Tạo Tư Duy Triệu Phú\' (499k) dạy mình cách nói KHÔNG với những cơ hội \'rác\' để tập trung vào những cú swing chất lượng. Tư duy quan trọng hơn kỹ thuật là vậy.',
      hashtags: ['#Focus', '#Tuduy', '#QualityOverQuantity', '#GemAcademy'],
    },
    {
      content: 'Cộng đồng Tier 2 (21 triệu) chất lượng thực sự. Sáng nay có bác share kèo bắt đáy theo công thức DPU (Down-Pause-Up) chuẩn từng pip. Được sinh hoạt trong môi trường này trình độ lên nhanh hẳn.',
      hashtags: ['#Community', '#Tier2', '#DPU', '#Learning'],
    },
    {
      content: 'Mình dùng \'Portfolio Tracker\' của Gem Academy được 3 tháng nay. Nó không chỉ track lỗ lãi mà còn phân tích hiệu suất theo từng setup. Nhờ đó mới biết mình đánh DPD tốt hơn UPU để mà tối ưu.',
      hashtags: ['#Analytics', '#DataDriven', '#Tier2', '#Tools'],
    },
    {
      content: 'Ai đang trade full-time thì nên cân nhắc Tier 3. Cái \'Whale Tracker\' giúp mình bơi cùng cá voi chứ không phải làm thức ăn cho nó. Thấy ví cá mập gom hàng là mình cũng rón rén vào theo, an tâm hơn hẳn.',
      hashtags: ['#WhaleTracker', '#OnChain', '#Tier3', '#SmartMoney'],
    },
    {
      content: 'Khóa học 299k (Starter) là vé vào cửa rẻ nhất để tiếp cận trí tuệ của Gem Academy. Đừng khinh thường nó rẻ, kiến thức nền tảng về Cấu trúc thị trường trong đó là nền móng cho mọi setup nâng cao sau này.',
      hashtags: ['#Foundation', '#Starter', '#MarketStructure'],
    },
    {
      content: 'Công thức HFZ (High Frequency Zones) trong Tier 2 giúp xác định vùng phản ứng giá cực mạnh. Kết hợp với Sentiment Analyzer để đo lường tâm lý đám đông nữa thì tỷ lệ thắng 75% là hoàn toàn có cơ sở.',
      hashtags: ['#HFZ', '#Sentiment', '#Tier2', '#Winning'],
    },
    {
      content: 'Review buổi Guest Expert trong nhóm Mastermind Elite (Tier 3) hôm qua: Khách mời chia sẻ về vĩ mô và chu kỳ dòng tiền đỉnh cao. Những thông tin này không bao giờ tìm thấy trên Google hay Youtube đâu.',
      hashtags: ['#Exclusive', '#Insight', '#Tier3', '#Mastermind'],
    },
    {
      content: 'Mình thích cách khóa \'Tái Tạo Tư Duy Triệu Phú\' bóc tách niềm tin sai lệch về sự giàu có. 499k để gỡ bỏ xiềng xích tâm thức đeo bám mấy chục năm nay. Quá rẻ!',
      hashtags: ['#Unblock', '#Mindset', '#Freedom', '#GemAcademy'],
    },
    {
      content: 'Scanner của gói Tier 1 (11 triệu) tuy chỉ có 7 patterns cơ bản nhưng nó hoạt động rất ổn định. Nó giúp mình tiết kiệm 3-4 tiếng soi chart mỗi ngày. Thời gian đó mình dành để học thêm tiếng Anh tài chính.',
      hashtags: ['#Efficiency', '#Tier1', '#Scanner', '#TimeManagement'],
    },
    {
      content: 'Combo \'Tần Số Gốc\' (1tr990) + \'Tần Số Tình Yêu\' (399k) là liều thuốc chữa lành tuyệt vời cho những tâm hồn đang tổn thương vì thị trường. Trade để sống, chứ đừng sống để trade. Cân bằng là chìa khóa.',
      hashtags: ['#Balance', '#Healing', '#LifeStyle', '#GemAcademy'],
    },
    {
      content: 'Gói Tier 3 có \'Support Ưu Tiên 4h\'. Hôm nọ tài khoản mình bị lỗi đăng nhập lúc 2h sáng, nhắn support cái 15p sau được fix luôn để kịp vào lệnh. Dịch vụ đẳng cấp nó phải thế.',
      hashtags: ['#Support', '#247Service', '#Tier3', '#GemTrading'],
    },
    {
      content: 'Quy trình \'5-layer confluence\' (hợp lưu 5 lớp) trong Tier 2 dạy mình tính kỷ luật thép. Không đủ 5 yếu tố hội tụ thì ngồi ngoài chơi xơi nước. Thà nuốt nước miếng còn hơn lau nước mắt.',
      hashtags: ['#Discipline', '#Tier2', '#Rules', '#Trading'],
    },
    {
      content: 'Nếu bạn hỏi mình nên bắt đầu từ đâu? Hãy bắt đầu từ gói Starter 299k + Khóa \'Tái Tạo Tư Duy Triệu Phú\' 499k. Tổng chưa đến 1 triệu để trang bị cả Tư duy lẫn Kỹ năng nền tảng. Khởi đầu hoàn hảo.',
      hashtags: ['#StartSmall', '#ThinkBig', '#GemAcademy', '#Advice'],
    },
    {
      content: 'Từ một người luôn lo âu về tiền bạc, khóa học \'Tái Tạo Tư Duy Triệu Phú\' (499k) đã giúp mình nhìn nhận lại giá trị bản thân. Khi tâm thức thay đổi, dòng tiền tự nhiên chảy về. Cảm ơn Gem Academy vì bài học quý giá này.',
      hashtags: ['#SuccessStory', '#WealthMindset', '#GemAcademy'],
    },
    {
      content: 'Gói Tier 3 (68 triệu) không dành cho những ai thích \'đánh nhanh thắng nhanh\'. Nó dành cho những người muốn xây dựng một sự nghiệp trading bền vững 10-20 năm. Tư duy dài hạn mới tạo ra kết quả vĩ đại.',
      hashtags: ['#LongTermGame', '#Career', '#Tier3', '#GemTrading'],
    },
    {
      content: 'Sáng nay mở Pattern Scanner trong gói Starter 299k lên thấy báo mô hình đẹp quá. Vào lệnh xong đi cafe, chiều về thấy TP (Take Profit). Cuộc sống trader đôi khi chỉ đơn giản vậy thôi.',
      hashtags: ['#SimpleLife', '#TradingLifestyle', '#Scanner', '#Starter'],
    },
    {
      content: 'Ai bảo học trading khô khan? Khóa \'7 Ngày Khai Mở Tần Số Gốc\' (1tr990) của Gem dạy mình cách thiền định để kết nối với trực giác. Nhờ đó mà những quyết định giao dịch của mình trở nên sắc bén hơn bao giờ hết.',
      hashtags: ['#Intuition', '#Meditation', '#TanSoGoc', '#GemAcademy'],
    },
    {
      content: 'Trước khi biết đến Frequency Trading, mình trade như một con bạc khát nước. Sau khi học xong Tier 2 (21 triệu), mình trade như một \'xạ thủ\': Kiên nhẫn, chờ đợi và chỉ bóp cò khi mục tiêu vào đúng tầm ngắm (HFZ).',
      hashtags: ['#SniperTrading', '#Discipline', '#Tier2', '#GemTrading'],
    },
    {
      content: 'Đừng để cảm xúc chi phối ví tiền của bạn. Khóa \'Kích Hoạt Tần Số Tình Yêu\' (399k) giúp mình cân bằng cảm xúc, không còn cay cú khi thua và không quá phấn khích khi thắng. Tâm bất biến giữa dòng đời vạn biến.',
      hashtags: ['#EmotionalControl', '#TradingPsychology', '#GemAcademy'],
    },
    {
      content: 'Sự đầu tư khôn ngoan nhất là đầu tư vào bộ não. Gói Tier 1 (11 triệu) cung cấp cho bạn tấm bản đồ để không bị lạc lối trong thị trường tài chính. 1 năm sử dụng công cụ Scanner là quá đủ để lấy lại vốn học phí.',
      hashtags: ['#SmartInvestment', '#Education', '#Tier1'],
    },
    {
      content: 'Hôm qua thị trường sập, trong khi thiên hạ than khóc thì anh em trong nhóm Mastermind Elite (Tier 3) lại bình tĩnh tìm điểm vào lệnh Short theo dấu chân cá voi (Whale Tracker). Kiến thức và Công cụ tạo nên sự khác biệt.',
      hashtags: ['#DifferentResults', '#Mastermind', '#Tier3', '#GemAcademy'],
    },
    {
      content: 'Công thức DPU (Down-Pause-Up) của Tier 2 ảo diệu thực sự. Bắt đúng đáy con sóng hồi, tài khoản tăng 15% trong một tuần. Cảm ơn Gem Academy đã chia sẻ kiến thức độc quyền này.',
      hashtags: ['#DPU', '#Results', '#FrequencyTrading', '#Tier2'],
    },
    {
      content: 'Mọi người ơi, Chatbot trong gói Starter (299k) có giới hạn 10 lần/ngày nhưng dùng rất \'cuốn\'. Nó báo tín hiệu chuẩn, giúp mình đỡ phải dán mắt vào màn hình. Rất phù hợp cho ai mới tập tành.',
      hashtags: ['#StarterPack', '#Chatbot', '#Review'],
    },
    {
      content: 'Mình đã từng nghi ngờ về \'Tần số\' trong trading. Nhưng sau khi trải nghiệm khóa học của Gem, mình tin rằng: Mọi chuyển động của giá đều mang một tần số nhất định. Bắt được tần số là bắt được lợi nhuận.',
      hashtags: ['#Belief', '#ScienceOfTrading', '#Frequency', '#GemTrading'],
    },
    {
      content: 'Khóa \'Tái Tạo Tư Duy Triệu Phú\' (499k) không chỉ giúp mình kiếm tiền mà còn giúp mình biết cách giữ tiền và nhân bản nó. Đây là mảnh ghép còn thiếu mà trường học không bao giờ dạy bạn.',
      hashtags: ['#FinancialLiteracy', '#MoneyManagement', '#GemAcademy'],
    },
    {
      content: 'Gói Tier 2 (21 triệu) là bước đệm hoàn hảo để chuyển mình từ trader nghiệp dư sang bán chuyên. 6 công thức độc quyền + 8 tool xịn sò là vũ khí hạng nặng để chiến đấu với market maker.',
      hashtags: ['#LevelUp', '#SemiPro', '#Tier2', '#GemTrading'],
    },
    {
      content: 'Thích nhất là cảm giác mỗi sáng thức dậy, mở \'News & Events Calendar\' của Gem lên để xem hôm nay thị trường có biến động gì. Lập kế hoạch giao dịch bài bản giúp mình tự tin hơn hẳn.',
      hashtags: ['#Planning', '#MorningRoutine', '#Tools'],
    },
    {
      content: 'Khóa \'7 Ngày Khai Mở Tần Số Gốc\' (1tr990) là món quà tuyệt vời mình dành tặng bản thân. Sau 7 ngày, mình thấy yêu đời hơn, năng lượng tích cực tràn trề, và lạ thay là công việc trading cũng thuận lợi hơn.',
      hashtags: ['#SelfGift', '#Transformation', '#TanSoGoc'],
    },
    {
      content: 'AI Prediction Tool trong Tier 3 dự báo xu hướng với độ chính xác 73%. Tuy nhiên, mình luôn kết hợp với nhận định cá nhân để vào lệnh. Công nghệ phục vụ con người, chứ không thay thế con người.',
      hashtags: ['#AI', '#HumanTouch', '#Tier3', '#TradingWisdom'],
    },
    {
      content: 'Đừng để trading chiếm hết thời gian của bạn. Với phương pháp Frequency Trading của Gem, mình chỉ mất 1-2 tiếng mỗi ngày để phân tích và đặt lệnh. Thời gian còn lại để tận hưởng cuộc sống.',
      hashtags: ['#Freedom', '#TimeManagement', '#GemAcademy'],
    },
    {
      content: 'Combo 3 khóa Tư Duy (Khai Mở Tần Số Gốc + Tần Số Tình Yêu + Tư Duy Triệu Phú) là nền móng vững chắc nhất cho bất kỳ ai muốn thành công toàn diện. Thân - Tâm - Trí hợp nhất thì làm gì cũng thắng.',
      hashtags: ['#HolisticSuccess', '#MindsetTrilogy', '#GemAcademy'],
    },
    {
      content: 'Cộng đồng Gemral trong gói Starter (299k) rất văn minh và hiếu học. Không có spam, không có lùa gà, chỉ có những người đam mê Frequency Trading cùng nhau tiến bộ. Rất đáng để tham gia.',
      hashtags: ['#QualityCommunity', '#LearningTogether', '#Starter'],
    },
    {
      content: 'Nếu bạn muốn đi nhanh, hãy đi một mình. Nếu bạn muốn đi xa và xây dựng đế chế, hãy đi cùng Gem Academy (Tier 3). Hành trình vạn dặm bắt đầu từ một quyết định đúng đắn hôm nay.',
      hashtags: ['#ActionNow', '#Empire', '#Tier3', '#GemTrading'],
    },
  ],
  wealth: [
    {
      content: 'Tiền bạc thực chất là năng lượng. 💸\n\nNhiều bạn hỏi mình làm sao để thu hút sự giàu có. Câu trả lời không nằm ở việc bạn làm việc bao nhiêu giờ mỗi ngày, mà nằm ở tần số rung động của bạn đối với tiền.\n\nNếu bạn tiêu tiền trong sự sợ hãi, lo lắng hay tiếc nuối, bạn đang phát ra tín hiệu của sự \"thiếu thốn\". Vũ trụ sẽ đáp lại bằng chính sự thiếu thốn đó.\n\nNgược lại, hãy thử thanh toán mỗi hóa đơn với lòng biết ơn. Biết ơn vì mình có khả năng chi trả, biết ơn dịch vụ mình nhận được. Khi tâm thế bạn chuyển sang sự \"dư dả\", dòng tiền sẽ tự tìm đường quay về. 🌱\n\nBạn thường cảm thấy gì khi mở ví tiền? Chia sẻ thật lòng nhé!',
      hashtags: ['#WealthMindset', '#TamThucThinhVuong', '#LuatHapDan', '#Gemral'],
    },
    {
      content: 'Quy tắc 6 chiếc lọ - Cũ nhưng chưa bao giờ sai! 🏺\n\nĐừng đợi đến khi có nhiều tiền mới quản lý, hãy quản lý để có nhiều tiền hơn. Dù thu nhập hiện tại là bao nhiêu, hãy thử chia nhỏ nó ra:\n\n1. 55% Nhu cầu thiết yếu (Ăn, ở, đi lại)\n2. 10% Tiết kiệm dài hạn\n3. 10% Giáo dục (Đầu tư cho cái đầu là lãi nhất)\n4. 10% Hưởng thụ (Nuôi dưỡng đứa trẻ bên trong)\n5. 10% Tự do tài chính (Quỹ này chỉ dùng để đầu tư sinh lời)\n6. 5% Cho đi (Gieo hạt thiện lành)\n\nTháng này bạn đã bỏ tiền vào quỹ Tự do tài chính chưa? 💰',
      hashtags: ['#QuanLyTaiChinh', '#6Jars', '#TuDoTaiChinh', '#GemralTips'],
    },
    {
      content: 'FOMO - Kẻ thù số 1 của túi tiền 📉\n\nThấy xanh thì mua, thấy đỏ thì bán. Đó là tâm lý chung của 90% người mới bước vào thị trường (crypto/chứng khoán). Nhưng sự thật là: Lợi nhuận được sinh ra từ sự kiên nhẫn, không phải từ sự hưng phấn.\n\nTrước khi xuống tiền cho bất kỳ lệnh nào, hãy tự hỏi: \"Mình mua vì mình hiểu giá trị của nó, hay mua vì sợ người khác giàu trước mình?\".\n\nGiữ cái đầu lạnh và một trái tim nóng, nhưng đừng để lòng tham dẫn lối. 🔥',
      hashtags: ['#TradingPsychology', '#DauTuThongMinh', '#NoFOMO', '#Gemral'],
    },
    {
      content: 'Dọn dẹp ví tiền = Dọn đường cho tài lộc ✨\n\nBạn đối xử với chiếc ví của mình như thế nào? Nhét tiền lộn xộn, hóa đơn cũ nát, thẻ thừa lung tung? Đó là dấu hiệu của sự tắc nghẽn năng lượng tài chính.\n\nHãy dành 5 phút tối nay:\n- Sắp xếp tiền phẳng phiu, cùng chiều.\n- Vứt bỏ hết hóa đơn đã thanh toán (biểu tượng của việc chi tiền).\n- Có thể đặt thêm một viên đá Thạch Anh Vàng (Citrine) nhỏ để kích hoạt năng lượng thịnh vượng.\n\nHãy trân trọng ngôi nhà của tiền, tiền sẽ trân trọng bạn.',
      hashtags: ['#PhongThuyViTien', '#NangLuongTienBac', '#Citrine', '#Gemral'],
    },
    {
      content: 'Lãi suất kép - Kỳ quan thứ 8 của thế giới 🌍\n\nEinstein từng nói vậy. Bạn không cần phải là thiên tài để giàu có, bạn chỉ cần thời gian và sự kỷ luật.\n\nTiết kiệm và đầu tư đều đặn một khoản nhỏ mỗi tháng, tái tục lãi sinh lời. Sau 5 năm, 10 năm, con số đó sẽ khiến bạn kinh ngạc. Đừng coi thường những đồng tiền lẻ. Tích tiểu thành đại, kiến tha lâu cũng đầy tổ.\n\nBạn bắt đầu hành trình tích sản từ năm bao nhiêu tuổi?',
      hashtags: ['#LaiSuatKep', '#TichSan', '#DauTuDaiHan', '#Gemral'],
    },
    {
      content: 'Tự do tài chính không phải là có núi tiền để không làm gì cả.\n\nMà là có đủ nguồn lực để ĐƯỢC LÀM những gì mình thích mà không phải lo nghĩ về cơm áo gạo tiền. Là khi bạn thức dậy và quyền lựa chọn nằm trong tay bạn.\n\nĐừng đặt mục tiêu là \"triệu đô\" nếu bạn chưa biết mình sẽ sống thế nào với số tiền đó. Hãy thiết kế cuộc sống mơ ước trước, con số sẽ theo sau. 🌈',
      hashtags: ['#TuDoTaiChinh', '#LifeDesign', '#GemralMotivation'],
    },
    {
      content: 'Stoploss (Cắt lỗ) là một nghệ thuật 🎨\n\nTrong đầu tư hay trading, gồng lời thì khó mà gồng lỗ thì... vô cực. Tại sao chúng ta sợ cắt lỗ? Vì cái tôi không muốn thừa nhận mình sai.\n\nNhưng hãy nhớ: Cắt lỗ là bảo vệ vốn. Còn vốn là còn cơ hội. Mất vốn là game over. Đừng để một lệnh thua biến thành một khoản đầu tư dài hạn bất đắc dĩ nhé các bác! 😂',
      hashtags: ['#Stoploss', '#QuanTriRuiRo', '#TradingWisdom', '#Gemral'],
    },
    {
      content: '3 Thói quen nhỏ tạo nên sự giàu có lớn:\n\n1. **Đọc sách mỗi ngày:** Kiến thức là đòn bẩy cao nhất của thu nhập.\n2. **Kết giao với người giỏi hơn mình:** Bạn là trung bình cộng của 5 người bạn hay gặp nhất. Chọn bạn mà chơi, chọn thầy mà học.\n3. **Tập thể dục:** Sức khỏe là con số 1, tiền bạc là những con số 0 phía sau. Mất số 1 thì dãy số vô nghĩa.\n\nBạn đang duy trì được thói quen nào rồi?',
      hashtags: ['#PhatTrienBanThan', '#ThoiQuenGiauCo', '#Gemral'],
    },
    {
      content: 'Ngày xưa, mình từng nghĩ cứ làm việc chăm chỉ là sẽ giàu. Mình cày ngày cày đêm, sức khỏe đi xuống, nhưng tài khoản vẫn dậm chân tại chỗ. 😓\n\nCho đến khi mình hiểu về \"Thu nhập thụ động\" và \"Dùng tiền đẻ ra tiền\". Mình bắt đầu học cách đầu tư, từ những số vốn rất nhỏ. Sai lầm có, mất mát có, nhưng bài học nhận được là vô giá.\n\nBây giờ, tư duy của mình khác rồi: Làm việc thông minh hơn, không phải chăm chỉ hơn. Đừng để tiền ngủ yên trong khi bạn đang thức làm việc vì nó.',
      hashtags: ['#MyStory', '#DauTu', '#ThuNhapThuDong', '#Gemral'],
    },
    {
      content: 'Cây Kim Tiền hay Mèo Thần Tài có thực sự mang lại tiền? 🤔\n\nThực ra, bản thân vật phẩm không tạo ra tiền. Nhưng nó là \"neo tâm thức\". Mỗi lần nhìn thấy nó, bạn được nhắc nhở về mục tiêu thịnh vượng, về sự may mắn.\n\nNăng lượng của sự tập trung chảy về đâu, tài khí tụ về đó. Vậy nên, đừng chỉ mua về để đó, hãy thổi hồn và ý niệm vào những vật phẩm phong thủy của bạn nhé!',
      hashtags: ['#PhongThuy', '#TamLinh', '#ChieuTaiLoc', '#Gemral'],
    },
    {
      content: 'Sai lầm \"chí mạng\" khi mới đầu tư: ALL-IN (Tất tay). ❌\n\nNghe ai đó phím hàng, thấy kèo ngon, thế là dốc hết vốn liếng, thậm chí vay mượn để vào một lệnh. Được ăn cả, ngã về không.\n\nĐó không phải đầu tư, đó là đánh bạc. Mà cờ bạc thì... người chơi luôn thua. Hãy luôn nhớ nguyên tắc phân bổ vốn. Giữ lại đường lui cho chính mình và gia đình.',
      hashtags: ['#SaiLamDauTu', '#QuanLyVon', '#Gemral'],
    },
    {
      content: 'Tiền không xấu. Tham lam mới xấu.\n\nNhiều người có niềm tin ngầm rằng \"người giàu thường keo kiệt\" hay \"tiền bạc là nguồn gốc tội lỗi\". Chính niềm tin này chặn đứng dòng chảy tài chính đến với bạn.\n\nHãy nhìn tiền như một công cụ. Với người tốt, tiền giúp họ làm nhiều việc thiện hơn, giúp đỡ nhiều người hơn. Hãy trở thành người tốt và giàu có! 💎',
      hashtags: ['#MoneyMindset', '#TuDuyTichCuc', '#Gemral'],
    },
    {
      content: 'Đừng ngủ quên trên một nguồn thu nhập duy nhất.\n\nĐại dịch vừa qua đã dạy chúng ta bài học đắt giá: Sự ổn định chỉ là ảo giác. Hãy đa dạng hóa nguồn thu:\n- Làm thêm nghề tay trái (freelance)\n- Bán hàng online\n- Đầu tư tài chính\n- Cho thuê tài sản\n\nBắt đầu xây dựng đường ống nước thứ hai ngay từ hôm nay, khi trời còn đang nắng đẹp. ☀️',
      hashtags: ['#ThuNhapThuDong', '#DaDangHoa', '#AnToanTaiChinh', '#Gemral'],
    },
    {
      content: 'Nếu ngay bây giờ bạn có 1 tỷ đồng trong tay, bạn sẽ làm gì đầu tiên?\n\nA. Mua sắm, du lịch xả hơi 🛍️\nB. Gửi tiết kiệm ngân hàng 🏦\nC. Đầu tư vào vàng/đất/coin 📈\nD. Trả hết nợ nần 💸\n\nComment đáp án của bạn bên dưới nhé! Cách bạn tiêu 1 tỷ sẽ nói lên tư duy tài chính của bạn.',
      hashtags: ['#QandA', '#TaiChinhCaNhan', '#Gemral'],
    },
    {
      content: 'Trong thị trường crypto, tin tức (News) là con dao hai lưỡi. 📰\n\nKhi tin tốt ra dồn dập, ai cũng hưng phấn, đó thường là lúc \"cá mập\" chốt lời. Khi tin xấu bủa vây, ai cũng sợ hãi bán tháo, đó lại là lúc cơ hội xuất hiện.\n\nHãy học cách tư duy ngược đám đông. \"Hãy tham lam khi người khác sợ hãi\". Nhưng nhớ là tham lam có kiến thức nhé! 😉',
      hashtags: ['#CryptoTrading', '#MarketCycle', '#Gemral'],
    },
    {
      content: 'Luật Nhân Quả trong tài chính.\n\nBạn muốn nhận được nhiều hơn? Hãy học cách cho đi trước. Cho đi không nhất thiết là tiền bạc nếu bạn chưa giàu. Có thể là kiến thức, là sự giúp đỡ, là một lời khuyên chân thành.\n\nSự hào phóng mở rộng dung lượng trái tim, và dung lượng trái tim quyết định dung lượng túi tiền. Gieo nhân nào, gặt quả nấy. 🌱',
      hashtags: ['#NhanQua', '#GieoHat', '#ThinhVuong', '#Gemral'],
    },
    {
      content: '\"Chi phí Latte\" - Kẻ trộm tiền âm thầm. ☕\n\nMỗi ngày một ly trà sữa, một cốc cà phê sang chảnh... 50k, 70k thấy nhỏ. Nhưng nhân lên 365 ngày, đó là một con số khổng lồ có thể dùng để đầu tư.\n\nMình không bảo bạn phải nhịn, nhưng hãy cân nhắc. Cắt giảm những chi tiêu nhỏ không cần thiết để đầu tư cho những mục tiêu lớn lao hơn trong tương lai. Sự hy sinh ngắn hạn cho tự do dài hạn.',
      hashtags: ['#TietKiem', '#ChiPhiLatte', '#TaiChinhThongMinh', '#Gemral'],
    },
    {
      content: 'Vàng - Kênh trú ẩn an toàn? 🌟\n\nTrong thời kỳ kinh tế biến động, lạm phát tăng cao, Vàng luôn là một danh mục không thể thiếu trong portfolio. Nó không giúp bạn x10, x100 tài sản nhanh chóng như Crypto, nhưng nó giúp bạn \"ngủ ngon\".\n\nMột danh mục đầu tư khỏe mạnh cần có sự cân bằng giữa Tấn công (Tài sản rủi ro cao) và Phòng thủ (Vàng, Tiền mặt). Bạn đang phân bổ thế nào?',
      hashtags: ['#DauTuVang', '#QuanLyTaiSan', '#Gemral'],
    },
    {
      content: 'Đừng so sánh hậu trường của mình với trailer của người khác.\n\nTrên mạng xã hội, ai cũng khoe lãi, khoe xe, khoe nhà. Bạn nhìn vào và cảm thấy áp lực, thấy mình tụt hậu? Đừng lo. Mỗi người có múi giờ riêng.\n\nHọ thành công năm 20 tuổi, bạn có thể thành công năm 30, 40 tuổi. Quan trọng là bạn ngày hôm nay tốt hơn bạn ngày hôm qua. Tập trung vào hành trình của chính mình. 🚀',
      hashtags: ['#Motivation', '#KienDinh', '#PhatTrienBanThan', '#Gemral'],
    },
    {
      content: 'Cuốn sách đã thay đổi tư duy tài chính của bạn là gì?\n\nVới mình, đó là \"Cha giàu, Cha nghèo\". Nó giúp mình phân biệt rõ ràng giữa Tiêu sản và Tài sản. Mua ô tô để đi chơi là tiêu sản, mua ô tô để kinh doanh là tài sản (tương đối thôi nhé).\n\nHãy comment cuốn sách gối đầu giường của bạn để mọi người cùng tham khảo nào! 📚',
      hashtags: ['#SachHay', '#FinancialLiteracy', '#GemralCommunity'],
    },
    {
      content: 'DCA (Trung bình giá) - Chiến thuật cho người \"lười\" nhưng muốn thắng. 🐢\n\nThay vì đau đầu đoán đỉnh đoán đáy (mà thường là đoán toàn sai), hãy chia vốn ra và mua đều đặn hàng tuần/hàng tháng. Bất kể giá lên hay xuống.\n\n- Giá xuống: Bạn mua được nhiều số lượng hơn.\n- Giá lên: Tài sản của bạn tăng giá trị.\n\nDCA giúp loại bỏ yếu tố cảm xúc ra khỏi quyết định đầu tư. Mà trong thị trường này, ai ít cảm xúc hơn, người đó thắng.',
      hashtags: ['#DCA', '#ChienLuocDauTu', '#DauTuThongMinh', '#Gemral'],
    },
    {
      content: 'Nợ Tốt vs Nợ Xấu. Bạn có phân biệt được không?\n\n- **Nợ Xấu:** Vay tiền để mua tiêu sản (điện thoại xịn, xe sang, quần áo hiệu) những thứ mất giá ngay khi mua về. Đây là gông cùm.\n- **Nợ Tốt:** Vay tiền để mua tài sản (bất động sản cho thuê, vốn kinh doanh) những thứ sinh ra dòng tiền lớn hơn lãi vay. Đây là đòn bẩy.\n\nNgười giàu dùng nợ làm đòn bẩy. Người nghèo dùng nợ để thỏa mãn hiện tại. Hãy cẩn trọng khi ký bất kỳ hợp đồng vay nào nhé! 💳',
      hashtags: ['#QuanLyNo', '#TaiChinhCaNhan', '#DonBayTaiChinh', '#Gemral'],
    },
    {
      content: 'Định luật bảo toàn năng lượng trong Trading:\n\nTiền không tự sinh ra và mất đi, nó chỉ chuyển từ túi người thiếu kiên nhẫn sang túi người kiên nhẫn.\n\nNgồi im cũng là một vị thế (Position). Đôi khi, việc khó nhất không phải là mua hay bán, mà là... không làm gì cả. Có bác nào ngứa tay hay vào lệnh lung tung không? 😂',
      hashtags: ['#TradingHumor', '#KienNhan', '#DauTuCrypto', '#Gemral'],
    },
    {
      content: 'Bí mật của sự \"Hanh thông\" trong tiền bạc. 🌊\n\nNước phải chảy mới thành sông, tiền phải lưu thông mới sinh sôi. Đừng giữ khư khư tiền trong két sắt với nỗi sợ mất mát.\n\nHãy chi tiêu một cách thông minh và hoan hỷ. Khi bạn trả tiền cho một bữa ăn ngon, hãy thầm cảm ơn vì nó nuôi dưỡng cơ thể bạn. Khi dòng năng lượng của sự biết ơn đi kèm với dòng tiền, nó sẽ tạo ra một vòng lặp thịnh vượng quay trở lại với bạn.',
      hashtags: ['#NangLuongTienBac', '#LuuThong', '#LuatHapDan', '#Gemral'],
    },
    {
      content: 'Quỹ khẩn cấp (Emergency Fund) - Chiếc phao cứu sinh.\n\nTrước khi nghĩ đến chuyện đầu tư x10, x100, hãy đảm bảo bạn có đủ tiền mặt để sống trong 3-6 tháng nếu ngày mai... thất nghiệp.\n\nĐầu tư với số tiền \"không được phép mất\" là con đường nhanh nhất dẫn đến quyết định sai lầm. Tâm thế an yên mới sinh ra trí tuệ sáng suốt. Bạn đã có chiếc phao này chưa?',
      hashtags: ['#QuyKhanCap', '#AnToanTaiChinh', '#QuanLyTaiChinh', '#Gemral'],
    },
    {
      content: 'Theo bạn, kỹ năng nào quan trọng nhất để trở nên giàu có?\n\nA. Kỹ năng kiếm tiền (Sales, Marketing, Chuyên môn)\nB. Kỹ năng giữ tiền (Quản lý chi tiêu)\nC. Kỹ năng nhân tiền (Đầu tư)\n\nNhiều người giỏi A nhưng kém B, kết quả là \"thu nhập cao nhưng vẫn rỗng túi\". Cùng thảo luận nhé! 👇',
      hashtags: ['#KyNangTaiChinh', '#ThaoLuan', '#PhatTrienBanThan', '#Gemral'],
    },
    {
      content: 'Hiệu ứng Diderot - Tại sao càng mua sắm càng thấy thiếu?\n\nBạn mua một chiếc váy mới, rồi thấy đôi giày cũ không hợp, phải mua giày mới. Mua giày xong thấy túi xách lệch tông, lại mua túi... Đó là vòng xoáy tiêu dùng không hồi kết.\n\nHạnh phúc không đến từ việc sở hữu nhiều đồ đạc hơn, mà đến từ việc biết đủ. Một tâm trí \"biết đủ\" là một tâm trí giàu có nhất. 🌿',
      hashtags: ['#Minimalism', '#TamLyTieuDung', '#BietDu', '#Gemral'],
    },
    {
      content: 'Not your keys, not your coins. 🗝️\n\nTrong thế giới Crypto, nếu bạn để tiền trên sàn, đó là tiền của sàn. Sàn sập = Mất trắng (Bài học từ FTX, Luna vẫn còn đó).\n\nHãy học cách sử dụng ví lạnh hoặc ví cá nhân (Metamask, Trust...) để thực sự làm chủ tài sản của mình. Tự do tài chính đi kèm với trách nhiệm tự bảo quản tài sản. Đừng lười biếng với tiền của mình!',
      hashtags: ['#CryptoSafety', '#BaoMatTaiSan', '#Blockchain', '#Gemral'],
    },
    {
      content: '\"Giá cả là những gì bạn trả. Giá trị là những gì bạn nhận được.\" - Warren Buffett.\n\nĐừng chỉ nhìn vào giá (Price) của một đồng coin hay cổ phiếu. Hãy nhìn vào giá trị (Value) nội tại của nó.\n\nMột tài sản giá thấp có thể là đắt nếu nó vô giá trị (rác). Một tài sản giá cao có thể là rẻ nếu tiềm năng của nó còn lớn. Hãy là nhà đầu tư giá trị, đừng là con buôn giá cả.',
      hashtags: ['#WarrenBuffett', '#DauTuGiaTri', '#TuDuyDauTu', '#Gemral'],
    },
    {
      content: 'Bạn có sở trường gì không? Viết lách, thiết kế, Tarot, hay chỉ đơn giản là giỏi lắng nghe?\n\nHãy biến nó thành tiền. Trong kỷ nguyên Gig Economy (nền kinh tế tự do), không thiếu cách để kiếm thêm thu nhập từ kỹ năng lẻ.\n\nĐừng để kỹ năng của bạn bị lãng phí. Bắt đầu từ việc nhỏ: mở một gig trên Fiverr, Upwork hoặc đơn giản là đăng lên Facebook. Hành động ngay đi! 🚀',
      hashtags: ['#KiemTienOnline', '#Freelancer', '#SideHustle', '#Gemral'],
    },
    {
      content: 'Đá Thạch Anh Xanh (Aventurine) - Viên đá của cơ hội. 🍀\n\nNếu Thạch anh vàng là hút tài lộc, thì Thạch anh xanh mang lại sự may mắn trong các cơ hội và quyết định.\n\nNhững lúc cần đưa ra quyết định đầu tư quan trọng hoặc ký kết hợp đồng, mình thường mang theo một viên Aventurine hoặc đặt nó trên bàn làm việc. Nó giúp tâm trí bình ổn và thu hút những dòng năng lượng thuận lợi. Có ai trong Gemral team Xanh lá không? 💚',
      hashtags: ['#Aventurine', '#DaPhongThuy', '#MayMan', '#Gemral'],
    },
    {
      content: 'Lạm phát - Kẻ cắp vô hình. 🥷\n\nNếu bạn để 100 triệu trong két sắt, 10 năm sau nó vẫn là 100 triệu về mặt con số, nhưng giá trị mua sắm có thể chỉ còn 60-70 triệu.\n\nĐầu tư không chỉ để giàu, mà là để chạy đua với lạm phát. Nếu lãi suất đầu tư của bạn thấp hơn lạm phát, thực chất bạn đang nghèo đi mỗi ngày. Đừng để tiền \"chết\"!',
      hashtags: ['#LamPhat', '#KienThucTaiChinh', '#DauTu', '#Gemral'],
    },
    {
      content: 'DYOR - Do Your Own Research (Tự nghiên cứu đi!).\n\nĐừng bao giờ mua một mã nào chỉ vì \"KOL A bảo thế\" hay \"Thằng bạn thân phím hàng\". Tiền là của bạn, trách nhiệm là của bạn.\n\nKhi bạn tự tìm hiểu, bạn sẽ có niềm tin (conviction) để giữ lệnh khi thị trường rung lắc. Còn nếu mua theo người khác, giá giảm 10% là bạn đã hoảng loạn cắt lỗ rồi. Kiến thức là tấm khiên tốt nhất.',
      hashtags: ['#DYOR', '#CryptoTips', '#TuChuTaiChinh', '#Gemral'],
    },
    {
      content: 'Quy tắc 24 giờ.\n\nKhi muốn mua một món đồ xa xỉ (không phải nhu cầu thiết yếu), hãy đợi 24 giờ. Sau 1 ngày, nếu bạn vẫn thấy thực sự cần nó, hãy mua.\n\nNhưng 80% trường hợp, cảm giác háo hức nhất thời sẽ qua đi, và bạn sẽ nhận ra mình không cần nó đến thế. Đây là mẹo nhỏ giúp mình tiết kiệm được cả đống tiền khỏi mua sắm cảm xúc đấy! 😉',
      hashtags: ['#MeoTietKiem', '#SmartSpending', '#QuanLyTaiChinh', '#Gemral'],
    },
    {
      content: 'Bạn chơi với 5 triệu phú, bạn sẽ là người thứ 6.\nBạn chơi với 5 người than nghèo kể khổ, bạn sẽ là người thứ 6.\n\nMôi trường quyết định tư duy. Năng lượng có tính lây lan. Hãy lọc lại danh sách bạn bè, follow những người tích cực, tham gia các cộng đồng chất lượng (như Gemral chẳng hạn 😉).\n\nNâng cấp mối quan hệ chính là nâng cấp tài sản.',
      hashtags: ['#MoiQuanHe', '#TuDuyGiauCo', '#PhatTrienBanThan', '#Gemral'],
    },
    {
      content: 'Thu nhập thụ động không có nghĩa là \"không làm gì cũng có ăn\".\n\nNó có nghĩa là bạn làm việc cực lực một lần (xây hệ thống, viết sách, tạo khóa học, tích lũy vốn mua nhà) để sau đó dòng tiền tự chảy về.\n\nĐừng tin vào những lời mời gọi \"ngồi mát ăn bát vàng\" hay lãi suất cam kết cao ngất ngưởng. Không có bữa trưa nào miễn phí cả. Hãy lao động thông minh!',
      hashtags: ['#ThuNhapThuDong', '#CanhGiacLuaDao', '#KienThucDauTu', '#Gemral'],
    },
    {
      content: 'Lần đầu tiên mình \"đu đỉnh\", cảm giác thật sự rất tệ. Mở mắt ra là thấy tài khoản chia đôi. Mình mất ngủ, cáu gắt với người thân, không tập trung làm việc được.\n\nSau đó mình nhận ra: Mình đã để thị trường điều khiển cảm xúc của mình. Mình đã đầu tư quá số tiền mình chịu đựng được.\n\nBài học xương máu: Chỉ đầu tư số tiền mà nếu mất đi, chất lượng cuộc sống của bạn không bị ảnh hưởng. Giấc ngủ ngon quan trọng hơn mọi khoản lợi nhuận.',
      hashtags: ['#BaiHocDauTu', '#TamLyGiaoDich', '#MyStory', '#Gemral'],
    },
    {
      content: 'Luật Hấp Dẫn trong tài chính: \"Biết ơn những gì đang có trong khi theo đuổi những gì mình muốn\".\n\nNhiều người ghét công việc hiện tại, ghét mức lương hiện tại, và mong muốn giàu có. Nhưng năng lượng của sự \"chán ghét\" sẽ đẩy sự giàu có ra xa.\n\nHãy biết ơn công việc đang mang lại thu nhập cho bạn lúc này. Nó là bước đệm, là nhà tài trợ cho ước mơ của bạn. Trân trọng hiện tại là chìa khóa mở cửa tương lai.',
      hashtags: ['#LongBietOn', '#LuatHapDan', '#CareerGrowth', '#Gemral'],
    },
    {
      content: 'Đừng bỏ trứng vào một giỏ. 🥚\n\nNhưng cũng đừng bỏ vào 100 cái giỏ rồi không quản lý nổi. Đa dạng hóa danh mục đầu tư là tốt, nhưng đa dạng quá mức (Over-diversification) sẽ làm giảm hiệu suất sinh lời.\n\nHãy tập trung vào 3-5 danh mục mà bạn hiểu rõ nhất. \"Sự tập trung tạo nên của cải, sự đa dạng hóa giúp giữ của cải\".',
      hashtags: ['#QuanLyDanhMuc', '#PhanBoVon', '#DauTuHieuQua', '#Gemral'],
    },
    {
      content: 'Thất bại là học phí.\n\nĐừng sợ mất tiền khi mới bắt đầu. Hãy coi số tiền đã mất là học phí bạn trả cho thị trường để học được những bài học về quản lý vốn, về tâm lý, về sự kiên nhẫn.\n\nChừng nào bạn còn rút ra được bài học, chừng đó bạn chưa thất bại. Đứng dậy, phủi bụi và làm lại khôn ngoan hơn. 💪',
      hashtags: ['#NeverGiveUp', '#BaiHocCuocSong', '#GocNhinTichCuc', '#Gemral'],
    },
    {
      content: 'Bitcoin Halving là gì mà ai cũng nhắc? 🌕\n\nHiểu đơn giản: Cứ sau 4 năm, phần thưởng cho thợ đào Bitcoin sẽ giảm đi một nửa. Nguồn cung khan hiếm dần, trong khi nếu nhu cầu giữ nguyên hoặc tăng lên, giá sẽ tăng. Đó là quy luật Cung - Cầu cơ bản.\n\nLịch sử đã chứng minh Halving thường là ngòi nổ cho một chu kỳ tăng trưởng mới (Bull run). Nhưng đừng đợi đến ngày đó mới mua. Trong đầu tư, \"Tin ra là bán\". Hãy chuẩn bị vị thế từ mùa đông.',
      hashtags: ['#BitcoinHalving', '#CryptoCycle', '#KienThucCrypto', '#Gemral'],
    },
    {
      content: 'Vị trí \"Quyền lực\" (Command Position) trên bàn làm việc. 🏛️\n\nBạn có đang ngồi quay lưng ra cửa ra vào không? Đó là thế phạm kỵ trong phong thủy, tạo cảm giác bất an vô thức (bị đâm sau lưng).\n\nVị trí tốt nhất cho doanh nhân/trader:\n- Lưng dựa vào tường vững chãi (Huyền Vũ).\n- Mắt nhìn bao quát được cửa ra vào nhưng không đối diện trực tiếp.\n- Bên trái cao (Thanh Long), bên phải thấp (Bạch Hổ).\n\nSắp xếp lại bàn làm việc ngay để lấy lại vị thế chủ động trong công việc nhé!',
      hashtags: ['#PhongThuyVanPhong', '#NangLuongLanhDao', '#Workplace', '#Gemral'],
    },
    {
      content: 'Revenge Trading (Giao dịch trả thù) - Cơn nóng giận đốt cháy tài khoản. 🔥\n\nVừa bị cắt lỗ một lệnh đau điếng, máu nóng dồn lên não, bạn lập tức vào một lệnh khác (thường là volume to hơn) để \"gỡ\" lại ngay lập tức. Kết quả? Thường là lỗ kép.\n\nThị trường không nợ bạn gì cả. Khi thua lỗ, việc cần làm là tắt máy, đi dạo, thiền hoặc nghe nhạc. Chỉ quay lại khi tâm trí đã bình lặng. Đừng để cảm xúc cay cú cầm chuột.',
      hashtags: ['#TamLyGiaoDich', '#KyLuatTrading', '#RevengeTrading', '#Gemral'],
    },
    {
      content: 'Đá Thạch Anh Đen (Morion) hoặc Obsidian - Vệ sĩ cho Trader. 🛡️\n\nThị trường tài chính là nơi có trường năng lượng dao động cực mạnh (tham lam, sợ hãi, căng thẳng). Nếu bạn là người nhạy cảm, rất dễ bị \"nhiễm\" năng lượng tiêu cực này, dẫn đến stress và quyết định sai.\n\nMột trụ đá đen hoặc quả cầu Obsidian trên bàn trading sẽ giúp \"trấn\" và hấp thụ những năng lượng tiêu cực, giúp bạn giữ cái đầu lạnh và tâm thế vững vàng trước mọi con sóng.',
      hashtags: ['#DaHoMenh', '#TraderLife', '#BaoVeNangLuong', '#Gemral'],
    },
    {
      content: 'HODL - Không chỉ là sai chính tả của từ HOLD. ✊\n\nNó xuất phát từ một bài đăng lúc say rượu của một trader năm 2013, nhưng giờ nó là một hệ tư tưởng: \"Hold On for Dear Life\" (Giữ chặt bằng cả tính mạng).\n\nHODL không phải là giữ mù quáng một đồng coin rác (Shitcoin). HODL là niềm tin sắt đá vào dài hạn của những dự án nền tảng, bất chấp biến động ngắn hạn. Bạn là Trader lướt sóng hay là Holder chân chính?',
      hashtags: ['#HODL', '#CryptoCulture', '#DauTuGiaTri', '#Gemral'],
    },
    {
      content: 'Quy luật tập trung: \"Cái gì tập trung, cái đó mở rộng\".\n\nNếu bạn suốt ngày than vãn về nợ nần, thiếu thốn, giá cả leo thang... bạn đang dùng năng lượng của mình để nuôi dưỡng sự nghèo khó.\n\nThay vào đó, hãy tập trung vào CƠ HỘI, vào GIẢI PHÁP, vào SỰ BIẾT ƠN những gì đang có. Đổi góc nhìn, đổi cuộc đời. Tâm trí bạn là mảnh vườn, đừng gieo cỏ dại.',
      hashtags: ['#LuatHapDan', '#TuDuyTichCuc', '#Focus', '#Gemral'],
    },
    {
      content: 'Cảnh báo Scam: Airdrop \"trên trời rơi xuống\". 🛸\n\nTự nhiên trong ví xuất hiện một đống token lạ hoắc trị giá ngàn đô? Đừng vội mừng. Đó là chiêu trò của hacker. Chỉ cần bạn tò mò tương tác (approve) để bán nó, ví của bạn sẽ bị rút sạch tiền.\n\nTrong thế giới Web3, sự tò mò có thể giết chết... tài sản của bạn. Nguyên tắc bất di bất dịch: Không click link lạ, không tương tác token lạ.',
      hashtags: ['#CanhGiacScam', '#BaoMatVi', '#CryptoSecurity', '#Gemral'],
    },
    {
      content: 'Góc Tài Lộc (Wealth Corner) trong nhà bạn ở đâu? 💰\n\nTheo phong thủy, góc Đông Nam của ngôi nhà hoặc phòng khách tượng trưng cho sự thịnh vượng (Cung Tốn - Mộc).\n\nHãy giữ khu vực này sạch sẽ, sáng sủa. Có thể đặt một chậu cây xanh tốt (Mộc) hoặc một bể cá/đài phun nước nhỏ (Thủy sinh Mộc) để kích hoạt dòng chảy tài chính. Tuyệt đối tránh để thùng rác hay đồ đạc lộn xộn ở góc này nhé!',
      hashtags: ['#PhongThuyNhaO', '#GocTaiLoc', '#ChieuTai', '#Gemral'],
    },
    {
      content: 'Mùa Đông Crypto (Bear Market) là để xây dựng. ❄️\n\nKhi giá giảm, đám đông sợ hãi rời bỏ thị trường, báo chí đưa tin tiêu cực... Đó mới là lúc những triệu phú tương lai được sinh ra.\n\nHãy tận dụng thời gian này để học hỏi kiến thức (Research), tích lũy tài sản giá rẻ. Đừng để đến khi VTV đưa tin Bitcoin phá đỉnh mới lao vào mua. Mua khi trầm lắng, bán khi ồn ào.',
      hashtags: ['#BearMarket', '#CoHoi', '#TichSan', '#Gemral'],
    },
    {
      content: 'Kinh doanh không phải là \"lấy\" tiền của khách hàng.\n\nKinh doanh là trao GIÁ TRỊ và nhận lại phần thưởng tương xứng. Nếu bạn chỉ chăm chăm vào lợi nhuận mà quên mất giá trị cốt lõi, doanh nghiệp sẽ sớm lụi tàn.\n\n\"Phụng sự để dẫn đầu\". Tâm thế của người cho đi luôn là tâm thế của người chiến thắng. Doanh nghiệp của bạn đang giải quyết nỗi đau nào cho xã hội?',
      hashtags: ['#TrietLyKinhDoanh', '#GiaTriThuc', '#PhungSu', '#Gemral'],
    },
    {
      content: 'Đừng để \"Lối sống lạm phát\" (Lifestyle Inflation) ăn mòn thu nhập.\n\nLương tăng 5 triệu, bạn đổi ngay điện thoại mới, ăn nhà hàng sang hơn. Cuối cùng, mức tiết kiệm vẫn bằng 0.\n\nBí quyết của người giàu: Khi thu nhập tăng, hãy giữ nguyên mức chi tiêu cũ và đầu tư toàn bộ phần chênh lệch. Đừng nâng cấp cuộc sống vội, hãy nâng cấp tài sản trước.',
      hashtags: ['#QuanLyTaiChinh', '#LoiSongTietKiem', '#TuDoTaiChinh', '#Gemral'],
    },
    {
      content: 'Hỗ trợ (Support) và Kháng cự (Resistance) - Không chỉ là những đường kẻ.\n\nĐó là vùng tâm lý chiến. \n- Hỗ trợ: Nơi phe Mua thấy \"rẻ\" và nhảy vào đỡ giá.\n- Kháng cự: Nơi phe Bán thấy \"đắt\" hoặc những người đu đỉnh cũ muốn thoát hàng.\n\nHiểu được tâm lý đám đông đằng sau các mức giá sẽ giúp bạn không bị \"cá mập\" quét Stoploss. Trading là cuộc chơi tâm lý, không phải toán học.',
      hashtags: ['#PhanTichKyThuat', '#TradingPsychology', '#CryptoTrading', '#Gemral'],
    },
    {
      content: '5 Giây Luật Hấp Dẫn trước khi chuyển khoản/đầu tư. ✨\n\nTrước khi bấm nút \"Gửi\" hoặc \"Buy\", hãy dừng lại 5 giây. Hít thở sâu.\n\nĐặt một ý niệm (Intention): \"Số tiền này đi để sinh sôi nảy nở\", \"Khoản đầu tư này mang lại thịnh vượng cho mình và giá trị cho dự án\".\n\nĐừng đầu tư với tâm thế \"Cầu mong đừng lỗ\" hay \"Thử vận may\". Năng lượng sợ hãi sẽ thu hút rủi ro. Năng lượng tin tưởng sẽ thu hút thành quả.',
      hashtags: ['#IntentionalLiving', '#NangLuongDauTu', '#MindfulMoney', '#Gemral'],
    },
    {
      content: 'Câu chuyện Cây Tre. 🎋\n\n4 năm đầu tiên, cây tre chỉ cao thêm vài cm, nhưng bộ rễ của nó âm thầm lan rộng hàng chục mét dưới lòng đất. Đến năm thứ 5, nó bùng nổ và cao tới 30 mét chỉ trong 6 tuần.\n\nĐầu tư và làm giàu cũng vậy. Những năm tháng đầu tiên tích lũy kiến thức, vốn liếng có thể chẳng thấy kết quả đâu. Nhưng đó là lúc bạn xây bộ rễ. Đừng bỏ cuộc trước khi đến \"năm thứ 5\". Sự bùng nổ đang chờ bạn phía trước.',
      hashtags: ['#KienTri', '#BaiHocCuocSong', '#Motivation', '#Gemral'],
    },
    {
      content: 'Phân bổ vốn theo tháp tài sản.\n\n- Đáy tháp (Vững chắc): Bảo hiểm, Quỹ khẩn cấp.\n- Thân tháp (Tăng trưởng): Bất động sản, Cổ phiếu bluechip, Vàng.\n- Đỉnh tháp (Mạo hiểm): Crypto, Startup, Venture Capital.\n\nĐừng xây nhà từ nóc. Nếu đáy tháp không vững, một cơn gió nhẹ cũng làm sập cả gia tài. Bạn đang xây tháp của mình thế nào?',
      hashtags: ['#ThapTaiSan', '#PhanBoVon', '#QuanTriRuiRo', '#Gemral'],
    },
    {
      content: 'Staking là gì? Hiểu đơn giản là \"Gửi tiết kiệm\" trong Crypto.\n\nThay vì để coin nằm im trong ví, bạn khóa nó lại để hỗ trợ mạng lưới blockchain hoạt động và nhận phần thưởng (lãi suất). Đây là cách tạo dòng tiền thụ động tuyệt vời cho Holder.\n\nNhưng hãy cẩn thận: Lãi suất càng cao, rủi ro càng lớn (dự án scam, lạm phát token). Hãy chọn mặt gửi vàng, chọn chain gửi coin nhé!',
      hashtags: ['#Staking', '#DeFi', '#ThuNhapThuDong', '#Gemral'],
    },
    {
      content: 'Bạn thuộc team nào?\n\nTeam A: \"An cư lạc nghiệp\" - Phải mua nhà để ở trước rồi mới tính chuyện đầu tư.\nTeam B: \"Tự do xê dịch\" - Dùng tiền đầu tư sinh lời, ở nhà thuê để linh hoạt vốn.\n\nQuan điểm nào cũng có lý, tùy thuộc vào giai đoạn cuộc đời và khẩu vị rủi ro. Cùng tranh luận văn minh nhé! 👇',
      hashtags: ['#MuaNhaHayThueNha', '#Debate', '#TaiChinhCaNhan', '#Gemral'],
    },
    {
      content: 'Chọn ngành nghề kinh doanh theo Ngũ Hành. 🔥💧🌲\n\nBiết mình mệnh gì, chọn nghề tương sinh sẽ thuận buồm xuôi gió hơn:\n- Mệnh Hỏa: Hợp làm nhà hàng, thời trang, công nghệ, điện tử.\n- Mệnh Thủy: Hợp logistics, đồ uống, thủy hải sản, trading (dòng tiền chảy).\n- Mệnh Thổ: Bất động sản, xây dựng, nông nghiệp.\n- Mệnh Kim: Tài chính, ngân hàng, cơ khí, trang sức.\n- Mệnh Mộc: Giáo dục, y tế, nội thất, in ấn.\n\nBạn có đang làm đúng nghề \"trời sinh\" cho mình không?',
      hashtags: ['#NguHanh', '#ChonNghe', '#PhongThuyUngDung', '#Gemral'],
    },
    {
      content: 'Gồng lỗ thì lì, chốt lời thì non. 📉\n\nCăn bệnh thế kỷ của trader. Tại sao lỗ 50% vẫn giữ vì hy vọng nó hồi, nhưng lãi 10% đã bán vội vì sợ mất lãi?\n\nĐó là do \"Tâm lý sợ mất mát\" (Loss Aversion). Để khắc phục, hãy luôn có Plan (Kế hoạch) trước khi vào lệnh: Entry ở đâu, TP (Chốt lời) ở đâu, SL (Cắt lỗ) ở đâu. Và tuân thủ nó như một con robot.',
      hashtags: ['#TradingDiscipline', '#TamLyGiaoDich', '#PlanYourTrade', '#Gemral'],
    },
    {
      content: '\"Người giàu có nhất thành Babylon\" - Cuốn sách mỏng nhưng chứa đựng trí tuệ ngàn năm.\n\nNguyên tắc \"Trả cho mình trước\" (dành 1/10 thu nhập để tích lũy) từ cuốn sách này đã cứu rỗi tài chính của hàng triệu người. Đơn giản, dễ hiểu, nhưng cực kỳ thấm.\n\nNếu bạn chưa đọc, hãy tìm đọc ngay cuối tuần này nhé. Một liều thuốc bổ cho tư duy tiền bạc.',
      hashtags: ['#SachHayNenDoc', '#TuDuyTaiChinh', '#BookReview', '#Gemral'],
    },
    {
      content: '\"Nhiệt kế tài chính\" (Financial Thermostat) của bạn đang ở mức nào? 🌡️\n\nBạn có để ý những người trúng số thường trắng tay sau vài năm không? Vì nhiệt kế tài chính của họ được cài đặt ở mức thấp (nghèo khó). Khi số tiền vượt quá mức cài đặt, tiềm thức sẽ tìm cách \"tống khứ\" tiền đi để quay về mức an toàn cũ.\n\nMuốn giàu bền vững, bạn phải nâng mức nhiệt kế này lên trước. Hãy bắt đầu tin rằng mình XỨNG ĐÁNG với con số lớn hơn. Bạn định giá bản thân bao nhiêu?',
      hashtags: ['#NhietKeTaiChinh', '#TamThucThinhVuong', '#PhatTrienBanThan', '#Gemral'],
    },
    {
      content: 'Rich (Giàu) vs. Wealthy (Thịnh vượng). Khác nhau đấy nhé!\n\n- **Rich:** Có nhiều tiền, nhưng có thể rất bận rộn, stress và lo âu.\n- **Wealthy:** Có thời gian, có sức khỏe, có tự do và tiền tự làm việc cho mình.\n\nĐừng chỉ mưu cầu sự giàu có (số dư tài khoản), hãy mưu cầu sự Thịnh vượng (chất lượng cuộc sống). Bạn chọn làm người Rich hay người Wealthy? 💎',
      hashtags: ['#RichVsWealthy', '#TuDuyDung', '#ChatLuongSong', '#Gemral'],
    },
    {
      content: 'Tiền là tấm gương phóng đại tính cách. 🪞\n\nNếu bạn là người tốt, có tiền bạn sẽ làm nhiều việc thiện hơn. Nếu bạn là người xấu, có tiền bạn sẽ... xấu xa hơn.\n\nĐừng đổ lỗi cho tiền làm tha hóa con người. Tiền chỉ là công cụ khuếch đại những gì vốn có bên trong bạn. Hãy tu dưỡng tâm tính trước khi cầu mong tài lộc ập đến.',
      hashtags: ['#BanChatTienBac', '#TamTinh', '#TuDuong', '#Gemral'],
    },
    {
      content: 'Bí mật của sự Đủ Đầy: Hãy vui mừng cho thành công của người khác. 🎉\n\nKhi thấy ai đó khoe xe mới, nhà đẹp, bạn cảm thấy gì? Ghen tị (GATO) hay ngưỡng mộ?\n\n- Ghen tị = \"Tôi không có nó\" (Tần số thiếu thốn).\n- Chúc mừng = \"Tôi cũng sắp có nó\" (Tần số dư dả).\n\nVũ trụ không phân biệt người khác hay bạn, nó chỉ bắt tần số cảm xúc. Hãy tập thói quen chúc phúc cho sự giàu có xung quanh mình.',
      hashtags: ['#ChucPhuc', '#TanSoRungDong', '#LuatHapDan', '#Gemral'],
    },
    {
      content: 'Tư duy \"Đầu tư cho bản thân\" không chỉ là đi học.\n\nNó còn là:\n- Ăn một bữa sạch (healthy) thay vì đồ ăn nhanh.\n- Ngủ đủ 8 tiếng thay vì cày phim thâu đêm.\n- Từ chối một cuộc nhậu vô bổ để đọc sách.\n\nCơ thể và trí tuệ là cỗ máy in tiền xịn nhất bạn sở hữu. Hãy bảo dưỡng nó mỗi ngày.',
      hashtags: ['#InvestInYourself', '#SucKhoeLaVang', '#KyLuat', '#Gemral'],
    },
    {
      content: 'Giá trị của sự chờ đợi (Delayed Gratification).\n\nThí nghiệm kẹo dẻo (Marshmallow Test) đã chứng minh: Những đứa trẻ kiên nhẫn đợi để có 2 viên kẹo thường thành công hơn trong tương lai.\n\nTrong tài chính cũng vậy. Bạn có sẵn sàng đi xe số thêm 2 năm để dồn tiền mua đất, hay phải mua xe ga trả góp ngay cho \"bằng bạn bằng bè\"? Sự giàu có thuộc về những người biết kiên nhẫn.',
      hashtags: ['#KienNhan', '#TriHuanSuSungSuong', '#TuDuyDaiHan', '#Gemral'],
    },
    {
      content: 'Rủi ro lớn nhất là không dám chấp nhận rủi ro nào cả.\n\nTrong một thế giới thay đổi chóng mặt như hiện nay (AI, Blockchain, Khủng hoảng...), việc chọn phương án \"an toàn\" (như gửi tiết kiệm, làm công ăn lương ổn định) đôi khi lại là rủi ro nhất.\n\nHãy học cách quản trị rủi ro, chứ đừng trốn tránh nó. Bước ra khỏi vùng an toàn là nơi phép màu xảy ra. 🚀',
      hashtags: ['#RiskManagement', '#VungAnToan', '#DoiMoiTuDuy', '#Gemral'],
    },
    {
      content: 'Hãy đối xử với TIỀN như một người bạn tri kỷ. 🤝\n\nBạn có thích ở bên một người suốt ngày than vãn, trách móc, hay phớt lờ mình không? Chắc chắn là không. Tiền cũng vậy.\n\nNếu bạn nói \"Tôi ghét tiền\", \"Tiền bạc rắc rối quá\", tiền sẽ rời bỏ bạn. Hãy nói \"Tôi yêu tiền và tiền cũng yêu tôi\", \"Tiền đến với tôi dễ dàng và thường xuyên\". Ngôn từ kiến tạo thực tại.',
      hashtags: ['#MoneyRelationship', '#Affirmations', '#LoiKhangDinh', '#Gemral'],
    },
    {
      content: 'Thu nhập của bạn tỉ lệ thuận với GIÁ TRỊ bạn trao đi.\n\nĐừng hỏi \"Làm sao để kiếm nhiều tiền hơn?\", hãy hỏi \"Làm sao để mình trở nên giá trị hơn?\", \"Làm sao để giải quyết vấn đề cho nhiều người hơn?\".\n\nKhi bạn trở thành người có giá trị không thể thay thế, tiền bạc sẽ tự động theo sau như cái bóng. Tập trung vào Gốc (Giá trị), đừng chỉ nhìn vào Quả (Tiền).',
      hashtags: ['#GiaTriCotLoi', '#PhungSu', '#KinhDoanhTuTe', '#Gemral'],
    },
    {
      content: 'Người nghèo bán thời gian. Người giàu mua thời gian.\n\n- Người nghèo cố gắng làm tất cả mọi thứ để tiết kiệm tiền.\n- Người giàu thuê người khác làm để tiết kiệm thời gian.\n\nThời gian là tài nguyên duy nhất không thể tái tạo. Hãy học cách ủy quyền, thuê ngoài (outsource) những việc không quan trọng để tập trung vào những việc sinh ra dòng tiền lớn.',
      hashtags: ['#QuanLyThoiGian', '#HieuSuat', '#TuDuyNguoiGiau', '#Gemral'],
    },
    {
      content: 'Phá vỡ niềm tin giới hạn: \"Tiền bạc không mọc trên cây\". 🌳\n\nCâu nói này của ông bà ngày xưa dạy chúng ta tiết kiệm, nhưng vô tình gieo vào đầu tư duy khan hiếm.\n\nThực tế trong kỷ nguyên số, tiền có ở khắp mọi nơi (Internet). Cơ hội mọc lên như nấm sau mưa. Chỉ cần bạn có kỹ năng và tư duy đúng, việc kiếm tiền dễ dàng hơn thời xưa rất nhiều. Hãy tin rằng thế giới này cực kỳ trù phú.',
      hashtags: ['#PhaVoGioiHan', '#NiemTinTieuCuc', '#KyNguyenSo', '#Gemral'],
    },
    {
      content: 'Quy luật Nhân - Quả trong làm giàu: Gieo hào phóng, gặt thịnh vượng.\n\nBạn không cần phải giàu mới bắt đầu cho đi. Hãy hào phóng với những gì bạn có: một lời khen chân thành, một kiến thức hữu ích, hay 50k cho quỹ từ thiện.\n\nSự keo kiệt làm tắc nghẽn dòng chảy năng lượng. Sự hào phóng khơi thông dòng chảy đó. Hãy để tiền được lưu thông và mang lại hạnh phúc.',
      hashtags: ['#GieoHat', '#NhanQua', '#HaoPhong', '#Gemral'],
    },
    {
      content: 'Chịu trách nhiệm 100% cho tình hình tài chính của bạn.\n\nĐừng đổ lỗi cho nền kinh tế, cho chính phủ, cho sếp hay cho gia đình. Chừng nào bạn còn đổ lỗi, chừng đó bạn còn trao quyền kiểm soát cuộc đời mình cho người khác.\n\nGiây phút bạn nói: \"Tôi nghèo là do tôi, và tôi giàu cũng sẽ do tôi\", đó là lúc sức mạnh quay trở lại với bạn. Bạn là thuyền trưởng con tàu đời mình.',
      hashtags: ['#ChiuTrachNhiem', '#TuChuCuocDoi', '#BanLinh', '#Gemral'],
    },
    {
      content: 'Tầm nhìn dài hạn (Long-term Vision). 🔭\n\nNgười nghèo tính theo ngày (lương ngày). Tầng lớp trung lưu tính theo tháng (lương tháng). Người giàu tính theo thập kỷ, thế hệ.\n\nKhi bạn có tầm nhìn 10 năm, những biến động của thị trường ngày hôm nay chỉ là những gợn sóng nhỏ. Hãy kiên định với mục tiêu lớn, đừng để những khó khăn trước mắt làm mờ mắt.',
      hashtags: ['#TamNhin', '#DaiHan', '#KienDinh', '#Gemral'],
    },
    {
      content: 'Mạng lưới quan hệ là tài sản ròng (Your Network is your Net worth).\n\nĐừng chỉ kết giao với những người giống bạn. Hãy tìm những người có tư duy khác biệt, những người đã đạt được điều bạn muốn.\n\nĐừng ngại mời họ đi ăn, cà phê để học hỏi. Chi phí cho những cuộc gặp gỡ chất lượng là khoản đầu tư sinh lời nhất. Bạn đã mở rộng networking tháng này chưa?',
      hashtags: ['#Networking', '#QuanHeXaHoi', '#HocHoi', '#Gemral'],
    },
    {
      content: 'Bí mật của sự giàu có: Giải quyết vấn đề.\n\nTiền là thước đo cho mức độ và quy mô vấn đề bạn giải quyết được cho xã hội.\n\nElon Musk giải quyết vấn đề năng lượng và vũ trụ. Bác sĩ giải quyết vấn đề sức khỏe. Bạn giải quyết vấn đề gì? Vấn đề càng lớn, thù lao càng cao. Hãy tìm kiếm vấn đề, đừng tìm kiếm tiền.',
      hashtags: ['#GiaiQuyetVanDe', '#KhoiNghiep', '#TuDuyKinhDoanh', '#Gemral'],
    },
    {
      content: 'EQ (Trí tuệ cảm xúc) quan trọng hơn IQ trong đầu tư.\n\nKhi thị trường sập, người thông minh (IQ cao) vẫn có thể hoảng loạn bán tháo. Nhưng người có EQ cao sẽ giữ được bình tĩnh, kiểm soát nỗi sợ và nhìn thấy cơ hội.\n\nLàm chủ cảm xúc là làm chủ ví tiền. Đừng để tham lam và sợ hãi cầm lái quyết định của bạn.',
      hashtags: ['#EQ', '#TamLyDauTu', '#BanLinh', '#Gemral'],
    },
    {
      content: 'Sống đơn giản để tư duy thanh thoát (Minimalism).\n\nMark Zuckerberg luôn mặc áo thun xám để đỡ tốn năng lượng não bộ cho việc chọn đồ. \n\nKhi bạn giảm bớt những vật chất rườm rà, tâm trí bạn sẽ có nhiều không gian (ram) hơn cho những ý tưởng lớn, những chiến lược đầu tư. Giàu có không phải là phô trương, giàu có là tự do.',
      hashtags: ['#ToiGian', '#PhongCachSong', '#TapTrung', '#Gemral'],
    },
    {
      content: 'Di sản (Legacy) - Bạn muốn để lại gì?\n\nSự thịnh vượng thực sự không chỉ là số tiền bạn tiêu khi còn sống, mà là những gì bạn để lại khi ra đi. Là kiến thức, là sự giáo dục cho con cái, là những quỹ từ thiện mang tên bạn.\n\nHãy xây dựng sự giàu có với tâm thế của một người trồng cây đại thụ cho đời sau. Tầm vóc của bạn sẽ quyết định tài sản của bạn.',
      hashtags: ['#DiSan', '#YNghiaCuocSong', '#TamVoc', '#Gemral'],
    },
    {
      content: 'Hãy kết thúc ngày hôm nay bằng một lời khẳng định:\n\n\"Tôi là nam châm thu hút tiền bạc. Mọi nguồn lực thịnh vượng đang chảy về phía tôi. Tôi giàu có, hạnh phúc và bình an.\"\n\nHãy comment \"TÔI ĐÓN NHẬN\" để kích hoạt năng lượng này ngay bây giờ nhé! Chúc cả nhà Gemral ngủ ngon và mơ những giấc mơ lớn. ✨',
      hashtags: ['#Affirmation', '#LuatHapDan', '#GoodVibes', '#Gemral'],
    },
    {
      content: '\"Nhiệt kế tài chính\" (Financial Thermostat) của bạn đang ở mức nào? 🌡️\n\nBạn có để ý những người trúng số thường trắng tay sau vài năm không? Vì nhiệt kế tài chính của họ được cài đặt ở mức thấp (nghèo khó). Khi số tiền vượt quá mức cài đặt, tiềm thức sẽ tìm cách \"tống khứ\" tiền đi để quay về mức an toàn cũ.\n\nMuốn giàu bền vững, bạn phải nâng mức nhiệt kế này lên trước. Hãy bắt đầu tin rằng mình XỨNG ĐÁNG với con số lớn hơn. Bạn định giá bản thân bao nhiêu?',
      hashtags: ['#NhietKeTaiChinh', '#TamThucThinhVuong', '#PhatTrienBanThan', '#Gemral'],
    },
    {
      content: 'Rich (Giàu) vs. Wealthy (Thịnh vượng). Khác nhau đấy nhé!\n\n- **Rich:** Có nhiều tiền, nhưng có thể rất bận rộn, stress và lo âu.\n- **Wealthy:** Có thời gian, có sức khỏe, có tự do và tiền tự làm việc cho mình.\n\nĐừng chỉ mưu cầu sự giàu có (số dư tài khoản), hãy mưu cầu sự Thịnh vượng (chất lượng cuộc sống). Bạn chọn làm người Rich hay người Wealthy? 💎',
      hashtags: ['#RichVsWealthy', '#TuDuyDung', '#ChatLuongSong', '#Gemral'],
    },
    {
      content: 'Tiền là tấm gương phóng đại tính cách. 🪞\n\nNếu bạn là người tốt, có tiền bạn sẽ làm nhiều việc thiện hơn. Nếu bạn là người xấu, có tiền bạn sẽ... xấu xa hơn.\n\nĐừng đổ lỗi cho tiền làm tha hóa con người. Tiền chỉ là công cụ khuếch đại những gì vốn có bên trong bạn. Hãy tu dưỡng tâm tính trước khi cầu mong tài lộc ập đến.',
      hashtags: ['#BanChatTienBac', '#TamTinh', '#TuDuong', '#Gemral'],
    },
    {
      content: 'Bí mật của sự Đủ Đầy: Hãy vui mừng cho thành công của người khác. 🎉\n\nKhi thấy ai đó khoe xe mới, nhà đẹp, bạn cảm thấy gì? Ghen tị (GATO) hay ngưỡng mộ?\n\n- Ghen tị = \"Tôi không có nó\" (Tần số thiếu thốn).\n- Chúc mừng = \"Tôi cũng sắp có nó\" (Tần số dư dả).\n\nVũ trụ không phân biệt người khác hay bạn, nó chỉ bắt tần số cảm xúc. Hãy tập thói quen chúc phúc cho sự giàu có xung quanh mình.',
      hashtags: ['#ChucPhuc', '#TanSoRungDong', '#LuatHapDan', '#Gemral'],
    },
    {
      content: 'Tư duy \"Đầu tư cho bản thân\" không chỉ là đi học.\n\nNó còn là:\n- Ăn một bữa sạch (healthy) thay vì đồ ăn nhanh.\n- Ngủ đủ 8 tiếng thay vì cày phim thâu đêm.\n- Từ chối một cuộc nhậu vô bổ để đọc sách.\n\nCơ thể và trí tuệ là cỗ máy in tiền xịn nhất bạn sở hữu. Hãy bảo dưỡng nó mỗi ngày.',
      hashtags: ['#InvestInYourself', '#SucKhoeLaVang', '#KyLuat', '#Gemral'],
    },
    {
      content: 'Giá trị của sự chờ đợi (Delayed Gratification).\n\nThí nghiệm kẹo dẻo (Marshmallow Test) đã chứng minh: Những đứa trẻ kiên nhẫn đợi để có 2 viên kẹo thường thành công hơn trong tương lai.\n\nTrong tài chính cũng vậy. Bạn có sẵn sàng đi xe số thêm 2 năm để dồn tiền mua đất, hay phải mua xe ga trả góp ngay cho \"bằng bạn bằng bè\"? Sự giàu có thuộc về những người biết kiên nhẫn.',
      hashtags: ['#KienNhan', '#TriHuanSuSungSuong', '#TuDuyDaiHan', '#Gemral'],
    },
    {
      content: 'Rủi ro lớn nhất là không dám chấp nhận rủi ro nào cả.\n\nTrong một thế giới thay đổi chóng mặt như hiện nay (AI, Blockchain, Khủng hoảng...), việc chọn phương án \"an toàn\" (như gửi tiết kiệm, làm công ăn lương ổn định) đôi khi lại là rủi ro nhất.\n\nHãy học cách quản trị rủi ro, chứ đừng trốn tránh nó. Bước ra khỏi vùng an toàn là nơi phép màu xảy ra. 🚀',
      hashtags: ['#RiskManagement', '#VungAnToan', '#DoiMoiTuDuy', '#Gemral'],
    },
    {
      content: 'Hãy đối xử với TIỀN như một người bạn tri kỷ. 🤝\n\nBạn có thích ở bên một người suốt ngày than vãn, trách móc, hay phớt lờ mình không? Chắc chắn là không. Tiền cũng vậy.\n\nNếu bạn nói \"Tôi ghét tiền\", \"Tiền bạc rắc rối quá\", tiền sẽ rời bỏ bạn. Hãy nói \"Tôi yêu tiền và tiền cũng yêu tôi\", \"Tiền đến với tôi dễ dàng và thường xuyên\". Ngôn từ kiến tạo thực tại.',
      hashtags: ['#MoneyRelationship', '#Affirmations', '#LoiKhangDinh', '#Gemral'],
    },
    {
      content: 'Thu nhập của bạn tỉ lệ thuận với GIÁ TRỊ bạn trao đi.\n\nĐừng hỏi \"Làm sao để kiếm nhiều tiền hơn?\", hãy hỏi \"Làm sao để mình trở nên giá trị hơn?\", \"Làm sao để giải quyết vấn đề cho nhiều người hơn?\".\n\nKhi bạn trở thành người có giá trị không thể thay thế, tiền bạc sẽ tự động theo sau như cái bóng. Tập trung vào Gốc (Giá trị), đừng chỉ nhìn vào Quả (Tiền).',
      hashtags: ['#GiaTriCotLoi', '#PhungSu', '#KinhDoanhTuTe', '#Gemral'],
    },
    {
      content: 'Người nghèo bán thời gian. Người giàu mua thời gian.\n\n- Người nghèo cố gắng làm tất cả mọi thứ để tiết kiệm tiền.\n- Người giàu thuê người khác làm để tiết kiệm thời gian.\n\nThời gian là tài nguyên duy nhất không thể tái tạo. Hãy học cách ủy quyền, thuê ngoài (outsource) những việc không quan trọng để tập trung vào những việc sinh ra dòng tiền lớn.',
      hashtags: ['#QuanLyThoiGian', '#HieuSuat', '#TuDuyNguoiGiau', '#Gemral'],
    },
    {
      content: 'Phá vỡ niềm tin giới hạn: \"Tiền bạc không mọc trên cây\". 🌳\n\nCâu nói này của ông bà ngày xưa dạy chúng ta tiết kiệm, nhưng vô tình gieo vào đầu tư duy khan hiếm.\n\nThực tế trong kỷ nguyên số, tiền có ở khắp mọi nơi (Internet). Cơ hội mọc lên như nấm sau mưa. Chỉ cần bạn có kỹ năng và tư duy đúng, việc kiếm tiền dễ dàng hơn thời xưa rất nhiều. Hãy tin rằng thế giới này cực kỳ trù phú.',
      hashtags: ['#PhaVoGioiHan', '#NiemTinTieuCuc', '#KyNguyenSo', '#Gemral'],
    },
    {
      content: 'Quy luật Nhân - Quả trong làm giàu: Gieo hào phóng, gặt thịnh vượng.\n\nBạn không cần phải giàu mới bắt đầu cho đi. Hãy hào phóng với những gì bạn có: một lời khen chân thành, một kiến thức hữu ích, hay 50k cho quỹ từ thiện.\n\nSự keo kiệt làm tắc nghẽn dòng chảy năng lượng. Sự hào phóng khơi thông dòng chảy đó. Hãy để tiền được lưu thông và mang lại hạnh phúc.',
      hashtags: ['#GieoHat', '#NhanQua', '#HaoPhong', '#Gemral'],
    },
    {
      content: 'Chịu trách nhiệm 100% cho tình hình tài chính của bạn.\n\nĐừng đổ lỗi cho nền kinh tế, cho chính phủ, cho sếp hay cho gia đình. Chừng nào bạn còn đổ lỗi, chừng đó bạn còn trao quyền kiểm soát cuộc đời mình cho người khác.\n\nGiây phút bạn nói: \"Tôi nghèo là do tôi, và tôi giàu cũng sẽ do tôi\", đó là lúc sức mạnh quay trở lại với bạn. Bạn là thuyền trưởng con tàu đời mình.',
      hashtags: ['#ChiuTrachNhiem', '#TuChuCuocDoi', '#BanLinh', '#Gemral'],
    },
    {
      content: 'Tầm nhìn dài hạn (Long-term Vision). 🔭\n\nNgười nghèo tính theo ngày (lương ngày). Tầng lớp trung lưu tính theo tháng (lương tháng). Người giàu tính theo thập kỷ, thế hệ.\n\nKhi bạn có tầm nhìn 10 năm, những biến động của thị trường ngày hôm nay chỉ là những gợn sóng nhỏ. Hãy kiên định với mục tiêu lớn, đừng để những khó khăn trước mắt làm mờ mắt.',
      hashtags: ['#TamNhin', '#DaiHan', '#KienDinh', '#Gemral'],
    },
    {
      content: 'Mạng lưới quan hệ là tài sản ròng (Your Network is your Net worth).\n\nĐừng chỉ kết giao với những người giống bạn. Hãy tìm những người có tư duy khác biệt, những người đã đạt được điều bạn muốn.\n\nĐừng ngại mời họ đi ăn, cà phê để học hỏi. Chi phí cho những cuộc gặp gỡ chất lượng là khoản đầu tư sinh lời nhất. Bạn đã mở rộng networking tháng này chưa?',
      hashtags: ['#Networking', '#QuanHeXaHoi', '#HocHoi', '#Gemral'],
    },
    {
      content: 'Bí mật của sự giàu có: Giải quyết vấn đề.\n\nTiền là thước đo cho mức độ và quy mô vấn đề bạn giải quyết được cho xã hội.\n\nElon Musk giải quyết vấn đề năng lượng và vũ trụ. Bác sĩ giải quyết vấn đề sức khỏe. Bạn giải quyết vấn đề gì? Vấn đề càng lớn, thù lao càng cao. Hãy tìm kiếm vấn đề, đừng tìm kiếm tiền.',
      hashtags: ['#GiaiQuyetVanDe', '#KhoiNghiep', '#TuDuyKinhDoanh', '#Gemral'],
    },
    {
      content: 'EQ (Trí tuệ cảm xúc) quan trọng hơn IQ trong đầu tư.\n\nKhi thị trường sập, người thông minh (IQ cao) vẫn có thể hoảng loạn bán tháo. Nhưng người có EQ cao sẽ giữ được bình tĩnh, kiểm soát nỗi sợ và nhìn thấy cơ hội.\n\nLàm chủ cảm xúc là làm chủ ví tiền. Đừng để tham lam và sợ hãi cầm lái quyết định của bạn.',
      hashtags: ['#EQ', '#TamLyDauTu', '#BanLinh', '#Gemral'],
    },
    {
      content: 'Sống đơn giản để tư duy thanh thoát (Minimalism).\n\nMark Zuckerberg luôn mặc áo thun xám để đỡ tốn năng lượng não bộ cho việc chọn đồ. \n\nKhi bạn giảm bớt những vật chất rườm rà, tâm trí bạn sẽ có nhiều không gian (ram) hơn cho những ý tưởng lớn, những chiến lược đầu tư. Giàu có không phải là phô trương, giàu có là tự do.',
      hashtags: ['#ToiGian', '#PhongCachSong', '#TapTrung', '#Gemral'],
    },
    {
      content: 'Di sản (Legacy) - Bạn muốn để lại gì?\n\nSự thịnh vượng thực sự không chỉ là số tiền bạn tiêu khi còn sống, mà là những gì bạn để lại khi ra đi. Là kiến thức, là sự giáo dục cho con cái, là những quỹ từ thiện mang tên bạn.\n\nHãy xây dựng sự giàu có với tâm thế của một người trồng cây đại thụ cho đời sau. Tầm vóc của bạn sẽ quyết định tài sản của bạn.',
      hashtags: ['#DiSan', '#YNghiaCuocSong', '#TamVoc', '#Gemral'],
    },
    {
      content: 'Hãy kết thúc ngày hôm nay bằng một lời khẳng định:\n\n\"Tôi là nam châm thu hút tiền bạc. Mọi nguồn lực thịnh vượng đang chảy về phía tôi. Tôi giàu có, hạnh phúc và bình an.\"\n\nHãy comment \"TÔI ĐÓN NHẬN\" để kích hoạt năng lượng này ngay bây giờ nhé! Chúc cả nhà Gemral ngủ ngon và mơ những giấc mơ lớn. ✨',
      hashtags: ['#Affirmation', '#LuatHapDan', '#GoodVibes', '#Gemral'],
    },
  ],
  affiliate: [
    {
      content: '💸 AFFILIATE VS. ĐỐI TÁC (CTV): SỰ KHÁC BIỆT NẰM Ở TƯ DUY\n\nNhiều bạn hỏi: \"Mình chỉ muốn share link kiếm tiền cafe thôi được không?\". Được chứ! Với mức **Affiliate Flat Rate 3%**, bạn vẫn có thể kiếm thêm chút đỉnh.\n\nNhưng nếu bạn muốn xây dựng sự nghiệp? Hãy nhìn vào bảng cơ chế của **CTV (Partner)**:\n- Hoa hồng sản phẩm số lên tới **30%** (Gấp 10 lần Affiliate thường!).\n- Hoa hồng đá phong thủy lên tới **15%**.\n- Và đặc biệt: **Thưởng nóng (Bonus KPI)** bằng tiền mặt.\n\nTại sao Gemral lại trả cao như vậy? Vì chúng tôi không tìm người \"rải link\". Chúng tôi tìm những người đồng hành, những người dám cam kết học tập và phát triển. \n\nBạn muốn nhặt tiền lẻ hay muốn hứng cơn mưa tài lộc? Lựa chọn nằm ở nút \"Đăng ký Đối tác\".',
      hashtags: ['#Gemral', '#AffiliateVsPartner', '#CoCheHoaHong', '#KiemTienOnline', '#SuNghiep'],
    },
    {
      content: '💎 BÁN \"ĐÁ\" HAY BÁN \"SỰ CHỮA LÀNH\"?\n\nKhi bạn cầm trên tay viên thạch anh của Yinyang Masters, đừng chỉ nghĩ nó là cục đá. Hãy nghĩ về nó như một **Công cụ Thiền** và **Sản phẩm Healing**.\n\nVới mức hoa hồng cho CTV khởi điểm từ **3% lên đến 15%** (cho cấp Grand), việc bán các sản phẩm vật lý (Physical Products) là cách dễ nhất để bắt đầu.\n\nTại sao? Vì nhu cầu là có thật. Ai cũng muốn bình an, ai cũng muốn bàn làm việc đẹp và tụ năng lượng. Đây là sản phẩm \"phễu\" tuyệt vời để bạn kết nối với khách hàng trước khi giới thiệu các gói khóa học cao cấp hơn.\n\nHãy bắt đầu từ những viên đá nhỏ, để xây nên tòa lâu đài lớn.',
      hashtags: ['#Gemral', '#YinyangMasters', '#DaNangLuong', '#BanHangTuTam', '#KhoiDau'],
    },
    {
      content: '📈 PHÂN TÍCH BÀI TOÁN: LÀM SAO ĐỂ ĐẠT THU NHẬP 10 TRIỆU ĐẦU TIÊN?\n\nVới cơ chế **Cấp 1 (Beginner)** của Gemral, bạn nhận 10% hoa hồng sản phẩm số. Hãy làm phép tính:\n\nChỉ cần bán được **5 khóa học Trading** (Tier 1 - 11 triệu):\n- Doanh số: 55 triệu.\n- Hoa hồng (10%): 5.5 triệu.\n- **ĐẶC BIỆT - BONUS KPI:** Đạt 5 học viên Trading -> Thưởng nóng **5 TRIỆU**.\n\n👉 Tổng thu nhập: 5.5 + 5 = **10.5 Triệu VNĐ**.\n\nChỉ cần tìm được 5 người muốn học giao dịch bài bản. Khó không? Không khó nếu bạn biết cách tiếp cận đúng tệp. 10 triệu đầu tiên không đến từ việc làm nhiều, mà đến từ việc hiểu rõ cơ chế thưởng!',
      hashtags: ['#Gemral', '#BaiToanThuNhap', '#KPIBonus', '#MucTieu', '#KeHoachHanhDong'],
    },
    {
      content: '🚀 LỘ TRÌNH THĂNG TIẾN: TỪ \"BEGINNER\" ĐẾN \"GRAND PARTNER\"\n\nỞ công ty truyền thống, bạn mất 5-10 năm để lên sếp. Ở Gemral, bạn có thể thăng cấp trong 3-6 tháng nhờ cơ chế **Tích lũy doanh số**.\n\n- **Beginner:** Bạn bắt đầu hành trình.\n- **Growing (Đạt 100M):** Hoa hồng tăng lên 15%. Bạn bắt đầu có đà.\n- **Master (Đạt 300M):** Hoa hồng 20%. Bạn là cao thủ.\n- **Grand (Đạt 600M):** Hoa hồng **30%** - Đỉnh cao danh vọng.\n\nDoanh số được cộng dồn, không bị reset mỗi tháng. Nghĩa là chỉ cần bạn kiên trì, không bỏ cuộc, chắc chắn bạn sẽ lên đỉnh. Bạn đang ở nấc thang nào rồi?',
      hashtags: ['#Gemral', '#ThangTien', '#TichLuyDoanhSo', '#GrandPartner', '#KienTri'],
    },
    {
      content: '🧠 BÁN KIẾN THỨC - BÁN SỰ THỊNH VƯỢNG\n\nTrong các sản phẩm của Gemral, các khóa học Mindset như **\"Tái tạo tư duy triệu phú\"** (499k) hay **\"Kích hoạt tần số tình yêu\"** (399k) là dễ bán nhất.\n\nGiá mềm (chỉ bằng bữa ăn), nhưng giá trị chuyển đổi tâm thức cực lớn. Đây là sản phẩm \"chim mồi\" hoàn hảo.\n\nChiến thuật cho CTV mới:\n1. Bán khóa học giá rẻ để khách hàng trải nghiệm chất lượng đào tạo.\n2. Khi họ thấy hay, tư vấn tiếp khóa **\"7 Ngày Khai Mở Tần Số Gốc\"** (1.99M).\n3. Khi họ muốn kiếm tiền từ trading, giới thiệu **Bundle Frequency Trading**.\n\nĐó gọi là chiến lược leo thang giá trị (Value Ladder). Đừng bán cái đắt nhất ngay từ đầu, hãy dẫn dắt họ đi từng bước.',
      hashtags: ['#Gemral', '#ChienLuocPheu', '#KhoaHocOnline', '#PhatTrienBanThan', '#Upsell'],
    },
    {
      content: '🔥 \"CƠN MƯA\" TIỀN THƯỞNG: GIẢI MÃ CHÍNH SÁCH BONUS KPI\n\nNhiều nơi chỉ trả hoa hồng %. Gemral chơi lớn: **Trả thêm tiền mặt (Hard Cash) khi đạt mốc.**\n\nNhìn vào bảng Bonus của cấp **Grand Partner** mà xem:\n- Đạt 25 học viên Trading -> Thưởng nóng **20 TRIỆU**.\n- Cộng với 30% hoa hồng của (25 x 11tr) = **82.5 TRIỆU**.\n👉 Tổng cầm về: **Hơn 100 TRIỆU/tháng**.\n\nĐây không phải bánh vẽ. Đây là con số thực tế mà các Top Partner đang nhận. Bạn có muốn tên mình nằm trong danh sách nhận thưởng tháng này không?',
      hashtags: ['#Gemral', '#ThuongNong', '#ThuNhapKhung', '#DongLuc', '#ChinhPhucMucTieu'],
    },
    {
      content: '🤖 BÁN CÔNG CỤ (TOOLS): MỎ VÀNG ÍT NGƯỜI BIẾT\n\nTrong giới Trading, ai cũng cần công cụ. **Gem Trading Scanner & Chatbot** không phải là khóa học lý thuyết, nó là \"cần câu cơm\".\n\nCác gói Bundle 11tr, 21tr, 68tr là sự kết hợp giữa **Kiến thức (Khóa học)** + **Công cụ (Scanner/Bot)**. Đây là combo hủy diệt.\n\nKhi bạn bán một giải pháp giúp khách hàng kiếm được tiền (từ trading), họ sẽ không tiếc tiền đầu tư. Hãy tập trung nhấn mạnh vào tính năng và hiệu quả của bộ công cụ độc quyền này khi tư vấn nhé!',
      hashtags: ['#Gemral', '#TradingTools', '#Scanner', '#GiaiPhapTaiChinh', '#BanGiaTri'],
    },
    {
      content: '🥇 CON ĐƯỜNG TRỞ THÀNH MENTOR/TRAINER: THU NHẬP 9 CON SỐ\n\nBạn có kỹ năng Trading tốt (Win rate 75%+)? Bạn có đam mê chia sẻ?\n\nĐừng dừng lại ở việc làm CTV bán hàng. Hãy phấn đấu trở thành **Mentor** của Gemral.\n- Lương cứng: 15M - 40M/tháng.\n- Bonus đào tạo: 10-15% trên mỗi học viên.\n- Royalty (Bản quyền): 30% doanh thu từ content bạn tạo ra.\n\nĐây là nấc thang cao nhất trong sự nghiệp tại Gemral. Chúng tôi không chỉ tìm người bán hàng, chúng tôi tìm những người Thầy, những người Lãnh đạo. Hãy mài giũa kỹ năng trading và sư phạm ngay từ hôm nay.',
      hashtags: ['#Gemral', '#Mentor', '#Trainer', '#CareerPath', '#DinhCaoSuNghiep'],
    },
    {
      content: '⚖️ CÂN BẰNG GIỮA \"VẬT CHẤT\" VÀ \"TÂM LINH\"\n\nHệ sinh thái sản phẩm của chúng ta rất thú vị: Một bên là **Trading (Vật chất, Tiền bạc)**, một bên là **Healing/Thiền (Tâm linh, Tinh thần)**.\n\nĐừng nghĩ chúng mâu thuẫn. Chúng bổ trợ nhau. \n- Trader cần tâm tĩnh để giao dịch tốt -> Bán thêm đá, khóa thiền.\n- Người tu tập cũng cần tài chính để tự do -> Bán thêm khóa học tư duy, trading.\n\nLà một Partner của Gemral, bạn cần linh hoạt (Flexible). Đừng đóng khung khách hàng. Hãy nhìn thấy nhu cầu toàn diện của họ: Cần Tiền và Cần An.',
      hashtags: ['#Gemral', '#CanBang', '#TamLinhVaTaiChinh', '#CrossSell', '#HieuKhachHang'],
    },
    {
      content: '🎁 QUÀ TẶNG: KỊCH BẢN TƯ VẤN KHÓA HỌC TRADING \"BÁCH PHÁT BÁCH TRÚNG\"\n\nKhách hỏi: \"Bỏ 11 triệu ra học có chắc chắn lãi không em?\"\n\nBạn trả lời sao? \nA. \"Chắc chắn lãi ạ.\" (Sai! Đừng bao giờ cam kết lợi nhuận kiểu đó, mất uy tín).\nB. \"Em không biết.\" (Sai! Thể hiện sự thiếu chuyên nghiệp).\n\nCâu trả lời chuẩn: \"Dạ, trong đầu tư không có gì là 100%. Tuy nhiên, khóa học cung cấp PHƯƠNG PHÁP quản lý vốn và bộ công cụ Scanner giúp anh/chị tăng tỷ lệ thắng lên cao nhất. Học viên bên em tuân thủ kỷ luật đều có kết quả tốt...\"\n\nMình đã soạn sẵn bộ kịch bản xử lý từ chối cho các gói Bundle Trading. Partner nào cần inbox mình gửi nhé!',
      hashtags: ['#Gemral', '#KichBanSale', '#XuLyTuChoi', '#TradingCourse', '#TuVanChuyenNghiep'],
    },
    {
      content: '🌟 7 NGÀY KHAI MỞ TẦN SỐ GỐC: KHÓA HỌC \"MUST-TRY\"\n\nTrước khi bán khóa học giá 1.990.000đ này, bạn hãy học nó đi.\n\nTại sao? Vì đây là khóa học nền tảng nhất của Jennie Uyên Chu. Nó thay đổi tần số rung động của bạn. Khi tần số bạn thay đổi, việc bán hàng sẽ trở nên dễ dàng như hơi thở.\n\nBạn không thể bán sự chuyển hóa nếu chính bạn chưa chuyển hóa. Hãy trở thành \"Sản phẩm của sản phẩm\". Khi bạn thay đổi, bạn bè sẽ tự hỏi: \"Sao dạo này mày khác thế, năng lượng thế?\". Lúc đó, bạn chỉ cần đưa link khóa học cho họ.',
      hashtags: ['#Gemral', '#TanSoGoc', '#ChuyenHoa', '#TraiNghiemThat', '#BanHangTuNhien'],
    },
    {
      content: '🧱 XÂY DỰNG NỀN MÓNG TỪ CẤP ĐỘ \"BEGINNER\"\n\nĐừng coi thường cấp độ 1 (Beginner). Ai cũng phải bắt đầu từ đây. \n\nỞ cấp độ này, bạn nhận 10% hoa hồng + 3% đá. Tuy chưa cao, nhưng đây là lúc bạn:\n- Học sản phẩm.\n- Rèn kỹ năng tư vấn.\n- Xây dựng tệp khách hàng đầu tiên.\n\nĐừng vội nhìn lên đỉnh núi mà nản lòng. Hãy tập trung đi thật vững những bước đầu tiên. Gemral có đầy đủ tài liệu, video training hỗ trợ bạn. Chỉ cần bạn chịu đi, đường sẽ mở.',
      hashtags: ['#Gemral', '#Newbie', '#BatDau', '#KienThucNenTang', '#KienTri'],
    },
    {
      content: '💎 GRAND PARTNER: KHÔNG CHỈ LÀ TIỀN, MÀ LÀ VỊ THẾ\n\nKhi bạn đạt cấp **Grand Partner** (Doanh số tích lũy 600M), bạn không chỉ nhận hoa hồng 30%.\n\nBạn được:\n- Làm việc trực tiếp với đội ngũ Core Team.\n- Tham gia các buổi họp chiến lược kín.\n- Có cơ hội trở thành cổ đông hoặc Mentor.\n\nĐây là vị thế của một người làm chủ cuộc chơi. Hãy đặt mục tiêu lên Grand trong vòng 6-12 tháng. Nó hoàn toàn khả thi nếu bạn có chiến lược đúng đắn.',
      hashtags: ['#Gemral', '#GrandPartner', '#ViThe', '#LanhDao', '#TamNhinDaiHan'],
    },
    {
      content: '🔄 TÍCH LŨY DOANH SỐ: CƠ CHẾ NHÂN VĂN NHẤT CỦA GEMRAL\n\nNhiều hệ thống khác ép doanh số tháng, không đạt là rớt hạng (reset). Áp lực kinh khủng!\n\nTại Gemral, chúng tôi hiểu ai cũng có lúc bận rộn, lúc ốm đau. Vì thế, cơ chế thăng cấp dựa trên **TỔNG DOANH SỐ TÍCH LŨY**.\n\nBạn bán được 10 triệu tháng này, tháng sau bán 20 triệu -> Tổng là 30 triệu. Cứ thế cộng dồn cho đến khi đủ mốc lên cấp. Không bao giờ mất đi công sức của bạn.\n\nĐây là chính sách để bạn yên tâm xây dựng sự nghiệp bền vững, không áp lực, không ôm hàng.',
      hashtags: ['#Gemral', '#ChinhSachNhanVan', '#KhongApLuc', '#BenVung', '#DoiTac'],
    },
    {
      content: '💰 TẠI SAO BÁN GÓI 68 TRIỆU LẠI DỄ HƠN BÁN GÓI 11 TRIỆU?\n\nNghịch lý trong kinh doanh High-ticket: Bán cho người giàu đôi khi dễ hơn bán cho người ít tiền.\n\n- Gói Tier 3 (68 triệu) có **Chatbot UNLIMITED 24 tháng** và Scanner 2 năm. Tính ra rẻ hơn rất nhiều so với mua lẻ.\n- Nhà đầu tư nghiêm túc họ nhìn vào ROI (Lợi nhuận đầu tư), họ thấy gói 68tr là tối ưu nhất về chi phí/thời gian.\n\nĐừng sợ bán giá cao. Hãy sợ mình không trao đủ giá trị. Khi bạn phân tích được bài toán lợi ích, khách hàng VIP sẽ xuống tiền trong một nốt nhạc.',
      hashtags: ['#Gemral', '#HighTicketClosing', '#TuDuyDauTu', '#GiaTriThuc', '#BanHangGiaCao'],
    },
    {
      content: '✨ TỪ KHÓA HỌC TÌNH YÊU ĐẾN TỰ DO TÀI CHÍNH\n\nNhiều bạn nữ đến với Gemral ban đầu chỉ vì muốn học khóa **\"Kích hoạt tần số tình yêu\"** (399k) để chữa lành mối quan hệ.\n\nNhưng sau khi học, họ nhận ra: Muốn hạnh phúc, phụ nữ cần tự chủ. Thế là họ đăng ký làm CTV, bán đá, bán khóa học. Dần dần họ học thêm về đầu tư, trading.\n\nGiờ đây, họ không chỉ hạnh phúc trong tình yêu mà còn tự do về tài chính. Gemral không chỉ dạy kiếm tiền, Gemral chuyển hóa cuộc đời. \n\nHãy chia sẻ câu chuyện chuyển hóa đó, bạn sẽ chạm đến trái tim của rất nhiều người phụ nữ ngoài kia.',
      hashtags: ['#Gemral', '#PhuNuKhiChat', '#TuChuTaiChinh', '#HanhPhuc', '#ChuyenHoa'],
    },
    {
      content: '🛠 CÔNG CỤ HỖ TRỢ TẬN RĂNG\n\nLàm Partner của Gemral, bạn không phải lo thiết kế ảnh, không lo viết bài mẫu, không lo soạn slide.\n\nTrong kho tài nguyên Partner có sẵn:\n- Ảnh sản phẩm lung linh.\n- Video review đá, demo scanner.\n- Bài viết mẫu cho từng loại sản phẩm.\n- Landing page chốt sale chuyên nghiệp.\n\nViệc của bạn chỉ là: **Tải về -> Đăng lên/Gửi khách -> Tư vấn -> Chốt**. \nChúng tôi đã dọn sẵn cỗ, bạn chỉ việc mời khách vào tiệc thôi!',
      hashtags: ['#Gemral', '#HoTroDoiTac', '#MarketingKit', '#DungCuKinhDoanh', '#DeDang'],
    },
    {
      content: '🛑 ĐỪNG CHỈ NHÌN VÀO % HOA HỒNG, HÃY NHÌN VÀO SỐ TIỀN THỰC NHẬN\n\n30% của 1 món hàng 100k là 30k.\n10% của 1 gói đầu tư 11 triệu là 1.1 triệu.\n\nĐừng chê % thấp ở các cấp bậc đầu. Hãy nhìn vào giá trị đơn hàng (AOV) của Gemral. Chúng ta bán những sản phẩm giá trị cao, nên dù % khởi điểm là 10% thì số tiền thực nhận vẫn rất lớn so với bán quần áo, mỹ phẩm.\n\nHãy làm bài toán kinh tế thông minh. Làm ít, hưởng nhiều nhờ bán sản phẩm giá trị cao.',
      hashtags: ['#Gemral', '#BaiToanKinhTe', '#ThuNhapThucTe', '#SmartChoice', '#Affiliate'],
    },
    {
      content: '🔮 BẠN ĐANG Ở ĐÚNG THỜI ĐIỂM VÀNG\n\nThị trường Crypto đang ấm lại. Nhu cầu chữa lành tâm thức đang bùng nổ sau đại dịch. \n\nGemral hội tụ cả 2 yếu tố thiên thời này: **Trading + Healing**.\n\nTrở thành đối tác của Gemral ngay lúc này là bạn đang đón đầu con sóng. Đừng đợi đến khi ai cũng làm rồi mới nhảy vào. Người đi tiên phong luôn là người chiếm lĩnh thị phần lớn nhất.\n\nĐăng ký ngay hôm nay để giữ vị trí của mình trong cộng đồng thịnh vượng này!',
      hashtags: ['#Gemral', '#ThoiDiemVang', '#CoHoi', '#Trend2025', '#HanhDongNgay'],
    },
    {
      content: '👋 HÀNH TRÌNH VẠN DẶM BẮT ĐẦU TỪ MỘT BƯỚC CHÂN\n\nCảm ơn các bạn đã theo dõi chuỗi bài viết về Kinh doanh & Affiliate. Chúng ta đã đi qua tư duy, kỹ năng, và giờ là chính sách cụ thể.\n\nMọi thứ đã sẵn sàng. Công cụ có, sản phẩm tốt, cơ chế thưởng hậu hĩnh.\n\nThứ duy nhất còn thiếu là **HÀNH ĐỘNG** của bạn.\n\nHãy inbox ngay cho Admin hoặc người giới thiệu bạn để lấy link đăng ký Partner. Đừng chần chừ nữa. Tương lai thịnh vượng của bạn đang chờ ở phía trước.\n\nHẹn gặp lại các bạn ở đỉnh vinh quang! Gemral xin chào! ❤️💎',
      hashtags: ['#Gemral', '#KetThucChuoiBai', '#CallToAction', '#KhoiDauMoi', '#ThinhVuong'],
    },
    {
      content: '💸 BÁN HÀNG HAY LÀ \'KẾT DUYÊN\'?\n\nNhiều bạn nhắn tin hỏi mình: \"Làm affiliate ngại nhất là cảm giác đi mời chào, chèo kéo người khác mua hàng\". Mình hiểu cảm giác đó. Trước đây mình cũng vậy, sợ bị đánh giá, sợ mất bạn bè.\n\nNhưng rồi mình nhận ra, đó là vì mình đang nhìn việc bán hàng dưới lăng kính của sự \"mưu cầu\". Mình muốn lấy tiền từ túi họ.\n\nThử đổi góc nhìn nhé: Nếu bạn biết một viên đá Thạch Anh có thể giúp một người đang stress tìm lại sự bình an, hay một cơ hội đầu tư có thể giúp một gia đình thoát cảnh nợ nần... và bạn giới thiệu nó cho họ. Đó đâu phải là bán hàng? Đó là bạn đang trao một giải pháp, một cơ hội, một cái \"Duyên\".\n\nTrong cộng đồng Gemral này, chúng ta không đi \"săn\" khách hàng. Chúng ta đi gieo hạt. Ai hữu duyên thì đón nhận, ai chưa đủ duyên thì hoan hỷ. Khi tâm thế bạn nhẹ nhàng, tự nhiên tiền bạc sẽ bị thu hút về phía bạn. Đó là quy luật năng lượng.\n\nBạn đang đi \"săn\" hay đi \"gieo\"? Comment chia sẻ quan điểm nhé! 👇',
      hashtags: ['#Gemral', '#AffiliateMarketing', '#TamThucThinhVuong', '#KinhDoanhTinhThuc', '#SacredCommerce'],
    },
    {
      content: '🚀 KHỞI NGHIỆP 0 ĐỒNG: CHUYỆN CỔ TÍCH HAY THỰC TẾ?\n\nNhiều người bảo khởi nghiệp không cần vốn là chuyện hoang đường. Ừ thì đúng là hoang đường nếu bạn nghĩ \"vốn\" chỉ là tiền mặt.\n\nNhưng trong kỷ nguyên số này, \"vốn\" của bạn chính là:\n1️⃣ Uy tín cá nhân (Personal Brand).\n2️⃣ Mạng lưới mối quan hệ (Network).\n3️⃣ Khả năng tạo nội dung (Content).\n\nLàm Affiliate hay trở thành Đối tác kinh doanh (Partner) chính là mô hình thông minh nhất để tận dụng 3 nguồn vốn vô hình đó. Bạn không cần nhập hàng, không lo kho bãi, không đau đầu vận hành. Việc của bạn là trở thành chiếc cầu nối đáng tin cậy.\n\nTại Gemral, có những bạn xuất phát điểm là sinh viên, mẹ bỉm sữa, nhưng thu nhập hàng tháng giờ đã vượt xa lương văn phòng nhờ biết cách leverage (đòn bẩy) hệ sinh thái sẵn có. Đừng đợi có tiền mới làm, hãy làm để có tiền.\n\nAi đang bắt đầu từ con số 0 điểm danh nào! 🙋‍♀️',
      hashtags: ['#Gemral', '#KhoiNghiep0Dong', '#Affiliate', '#ThuNhapThuDong', '#KinhDoanhOnline'],
    },
    {
      content: '💎 NGHỊCH LÝ CỦA NGƯỜI LÀM AFFILIATE: CÀNG ÍT BÁN, CÀNG BÁN ĐƯỢC NHIỀU\n\nNghe lạ đời nhỉ? Nhưng đây là sự thật mình chiêm nghiệm được sau 3 năm lăn lộn trong nghề.\n\nLúc mới làm, mình spam link khắp nơi. Facebook cá nhân toàn bài đăng sản phẩm, copy paste y chang nhau. Kết quả? Bạn bè hủy kết bạn, tương tác về 0, đơn hàng lẹt đẹt.\n\nSau đó mình thay đổi chiến thuật. Mình ngừng đăng bài bán hàng. Thay vào đó, mình chia sẻ trải nghiệm:\n- Mình kể về việc viên đá này đã giúp mình ngủ ngon thế nào.\n- Mình chia sẻ về tư duy tài chính mình học được từ một khóa học.\n- Mình show cho mọi người thấy lifestyle (phong cách sống) tích cực mà mình đang theo đuổi.\n\nThế là inbox tự nổ: \"Chị ơi, viên đá đó mua ở đâu?\", \"Anh ơi, khóa học đó còn slot không?\".\n\nKhách hàng không mua sản phẩm. Họ mua \"câu chuyện\" và \"kết quả\" của bạn. Hãy trở thành sản phẩm của sản phẩm (Product of the product). Đừng làm cái loa phát thanh, hãy làm ngọn hải đăng thu hút. 🌟',
      hashtags: ['#Gemral', '#PersonalBranding', '#AffiliateTips', '#KinhNghiemKinhDoanh', '#ThuHutKhachHang'],
    },
    {
      content: '📈 KIM TỨ ĐỒ TRONG AFFILIATE: BẠN ĐANG Ở CẤP ĐỘ NÀO?\n\nKhông phải ai làm Affiliate cũng giống nhau đâu nhé. Mình tạm chia thành 4 cấp độ:\n\nLevel 1: The Spammer (Kẻ rải truyền đơn)\nCopy link, dán vào mọi comment dạo, spam group. Thu nhập: Hên xui, thường là thấp và không bền.\n\nLevel 2: The Reviewer (Người trải nghiệm)\nMua về dùng, thấy tốt thì review. Có tâm hơn, uy tín hơn. Thu nhập: Khá, nhưng phụ thuộc vào việc liên tục ra content mới.\n\nLevel 3: The Community Builder (Người xây cộng đồng)\nTập hợp những người cùng sở thích (VD: thích phong thủy, thích crypto) vào một nhóm. Trao giá trị liên tục. Thu nhập: Ổn định và thụ động.\n\nLevel 4: The High-Ticket Closer (Nhà tư vấn cấp cao)\nKhông bán món lặt vặt. Tập trung vào các gói đầu tư, sản phẩm giá trị cao (High-ticket). Cần kiến thức sâu, uy tín lớn. Chỉ cần chốt 1 deal bằng người khác làm cả tháng. Đây là hướng đi của các \"Đối tác thịnh vượng\" tại Gemral.\n\nBạn đang ở level nào và muốn leo lên level nào? Comment để cùng bàn chiến lược nhé!',
      hashtags: ['#Gemral', '#LevelUp', '#AffiliateMarketing', '#HighTicketSales', '#PhatTrienBanThan'],
    },
    {
      content: '🛑 ĐỪNG LÀM AFFILIATE NẾU BẠN CHỈ MUỐN \"KIẾM TIỀN NHANH\"!\n\nXin lỗi phải nói thẳng, nhưng nếu bạn đang tìm kiếm một nút bấm thần kỳ để tiền rơi vào tài khoản sau một đêm, thì Affiliate (hay bất kỳ mô hình kinh doanh chân chính nào) không dành cho bạn.\n\nAffiliate là một nghề. Mà đã là nghề thì cần học:\n- Học cách thấu hiểu tâm lý con người.\n- Học cách viết content chạm đến cảm xúc.\n- Học cách xây dựng niềm tin.\n\nThời gian đầu có thể bạn sẽ không thấy kết quả ngay. Đó là giai đoạn \"làm móng\". Nhiều người bỏ cuộc ở tháng thứ 2, thứ 3 - ngay trước khi \"cây ra quả\".\n\nSự kiên trì + Lựa chọn đúng ngách (niche) + Một người dẫn đường (Mentor) giỏi = Công thức thành công.\n\nỞ Gemral, chúng mình không hứa hẹn làm giàu sau một đêm, nhưng hứa sẽ đồng hành để bạn xây dựng một dòng thu nhập bền vững. Ai đồng ý quan điểm \"chậm mà chắc\" thì thả tim nhé! ❤️',
      hashtags: ['#Gemral', '#TuDuyDung', '#KienTri', '#KinhDoanhBenVung', '#AffiliateSuccess'],
    },
    {
      content: '🤔 \"TÔI KHÔNG CÓ KHIẾU ĂN NÓI, CÓ LÀM ĐƯỢC KHÔNG?\"\n\nĐây là câu hỏi mình nhận được nhiều nhất từ các bạn CTV mới. Sự thật là: Những người bán hàng giỏi nhất thế giới không phải là người \"nói nhiều\", mà là người biết \"lắng nghe\".\n\nTrong mô hình kinh doanh hiện đại, đặc biệt là với các sản phẩm liên quan đến tâm linh, phong thủy hay đầu tư như ở Gemral, khách hàng không cần một cái máy nói xa xả vào mặt họ. Họ cần một người lắng nghe nỗi đau của họ, thấu hiểu vấn đề của họ và nhẹ nhàng đặt vào tay họ một giải pháp.\n\nBạn hướng nội? Tuyệt vời. Người hướng nội thường sâu sắc, tinh tế và biết lắng nghe hơn. Đó là lợi thế trời cho của bạn đấy!\n\nĐừng cố gắng trở thành một con vẹt khéo mồm. Hãy trở thành một người bạn chân thành. Sự chân thành là vũ khí sát thương cao nhất trong bán hàng.\n\nTeam hướng nội đâu rồi, cho mình thấy cánh tay của các bạn nào! 🙌',
      hashtags: ['#Gemral', '#IntrovertPower', '#KyNangBanHang', '#LangNghe', '#AffiliateChoNguoiHuongNoi'],
    },
    {
      content: '💰 THU NHẬP THỤ ĐỘNG: GIẢI MÃ CƠ CHẾ \"HOA HỒNG TRỌN ĐỜI\"\n\nBạn đi làm công ăn lương: Làm ngày nào ăn ngày đó. Nghỉ ốm là trừ lương. Ngừng làm là ngừng tiền.\n\nLàm Affiliate/Kinh doanh hệ thống: Bạn bỏ công sức ra một lần để tìm kiếm và chăm sóc một khách hàng. Nhưng nếu sản phẩm tốt và cơ chế tốt, khách hàng đó sẽ quay lại mua lần 2, lần 3, lần n... Hoặc họ giới thiệu thêm bạn bè.\n\nĐặc biệt với các sản phẩm có tính tái tiêu dùng cao hoặc tính tích lũy (như đầu tư), nỗ lực của bạn sẽ được cộng dồn. Tháng này bạn tìm được 10 khách. Tháng sau 10 khách nữa. Nhưng thu nhập tháng sau là từ 20 khách (10 mới + 10 cũ tái tục).\n\nĐó là vẻ đẹp của lãi kép trong nỗ lực. Đừng chỉ nhìn vào hoa hồng của đơn hàng đầu tiên. Hãy nhìn vào giá trị vòng đời của khách hàng (LTV). Đó mới là mỏ vàng thực sự.\n\nAi đang xây dựng đường ống nước thay vì đi xách nước thì comment \"Tự do\" nhé!',
      hashtags: ['#Gemral', '#PassiveIncome', '#LaiKep', '#TuDoTaiChinh', '#AffiliateStrategy'],
    },
    {
      content: '🌱 HẠT GIỐNG CỦA SỰ THỊNH VƯỢNG\n\nSáng nay ngồi thiền, mình ngẫm về quy luật \"Gieo hạt\" trong kinh doanh. Nhiều bạn làm Affiliate cứ chăm chăm vào việc: \"Làm sao để chốt đơn này?\", \"Làm sao để lấy hoa hồng cao nhất?\". Đó là tư duy săn bắn.\n\nThử đổi sang tư duy gieo trồng xem:\n- Giúp đỡ một người giải quyết vấn đề của họ (dù họ chưa mua gì).\n- Chia sẻ kiến thức miễn phí giúp cộng đồng tốt lên.\n- Kết nối người cần với người có.\n\nKhi bạn gieo những hạt giống thiện lành đó, vũ trụ sẽ nợ bạn. Và vũ trụ trả lãi rất hậu hĩnh. Có thể khách hàng đó không mua ngay, nhưng họ sẽ giới thiệu cho bạn một \"cá mập\". Hoặc cơ hội sẽ đến từ một hướng bạn không ngờ tới.\n\nKinh doanh cũng là tu tập. Sửa mình, giúp người, tiền sẽ tới. \nChúc cả nhà một ngày gieo được nhiều hạt giống lành! 🌱✨',
      hashtags: ['#Gemral', '#GieoHat', '#LuatNhanQua', '#KinhDoanhTuTe', '#MindfulnessBusiness'],
    },
    {
      content: 'TOOLS 🛠: 3 CÔNG CỤ KHÔNG THỂ THIẾU CHO DÂN AFFILIATE CHUYÊN NGHIỆP\n\nLàm việc thông minh hơn, không phải vất vả hơn. Để tối ưu hóa quy trình làm việc, đây là 3 app mình dùng hàng ngày:\n\n1. **Canva:** Không cần biết Photoshop vẫn có thể thiết kế ảnh quote, banner xịn xò. Hình ảnh đẹp là 50% chiến thắng.\n2. **ChatGPT (hoặc AI writing tool):** Bí ý tưởng content? Nhờ AI gợi ý dàn ý, viết tiêu đề giật tít. Nhưng nhớ edit lại theo giọng văn của mình nhé, đừng copy paste vô hồn.\n3. **CapCut:** Kỷ nguyên của video ngắn. Quay dựng đơn giản trên điện thoại. Một video TikTok viral có thể mang về lượng traffic bằng cả tháng chạy quảng cáo.\n\nCác bạn đang dùng công cụ nào để hỗ trợ công việc? Chia sẻ thêm ở dưới nha!',
      hashtags: ['#Gemral', '#Tools', '#CongCuKinhDoanh', '#HieuSuat', '#DigitalMarketing'],
    },
    {
      content: '😰 NỖI SỢ LỚN NHẤT: \"BẠN BÈ NÓI MÌNH ĐA CẤP/LÙA GÀ\"\n\nĐây là rào cản tâm lý số 1 khiến 90% người mới bỏ cuộc ngay từ vòng gửi xe. Mình cũng từng bị chặn, bị xì xào sau lưng.\n\nNhưng bạn ơi, hãy tỉnh táo:\n- Đa cấp biến tướng là lấy tiền người sau trả người trước, không có sản phẩm thật hoặc sản phẩm không có giá trị.\n- Affiliate/Đối tác là bạn đang phân phối những sản phẩm thật, có giá trị thật (đá năng lượng, khóa học, cơ hội đầu tư minh bạch) đến người cần nó.\n\nNếu sản phẩm bạn giới thiệu thực sự giúp người ta bình an hơn, giàu có hơn, hạnh phúc hơn, thì bạn đang làm phước chứ không phải làm phiền.\n\nĐừng để miệng lưỡi thiên hạ trả hóa đơn cho bạn. Chỉ có kết quả của bạn, sự trưởng thành của bạn mới là câu trả lời đanh thép nhất.\n\nCứ ngẩng cao đầu mà đi. Ai hiểu sẽ đồng hành, ai không hiểu thì... chúc họ may mắn! 💪',
      hashtags: ['#Gemral', '#VuotQuaNoiSo', '#BanLinh', '#KinhDoanhChanChinh', '#Mindset'],
    },
    {
      content: '🌈 7 NGUỒN THU NHẬP - BẠN CÓ MẤY NGUỒN RỒI?\n\nCác triệu phú trung bình có 7 nguồn thu nhập. Còn chúng ta thường chỉ có 1 (lương). Rủi ro quá lớn!\n\nAffiliate là cách dễ nhất để tạo ra nguồn thu nhập thứ 2, thứ 3 mà không cần bỏ việc chính. Bạn có thể:\n- Làm vào giờ nghỉ trưa.\n- Làm vào buổi tối thay vì lướt Face vô bổ.\n- Làm vào cuối tuần.\n\nNó giống như việc bạn trồng thêm một cái cây trong vườn. Lúc đầu nó bé xíu, nhưng nếu chăm bón, sau này nó sẽ cho quả ngọt, thậm chí bóng mát của nó còn lớn hơn cả công việc chính.\n\nĐừng bỏ tất cả trứng vào một giỏ. Hãy bắt đầu đa dạng hóa nguồn thu ngay hôm nay cùng hệ sinh thái Gemral.\n\nBạn nào muốn tìm hiểu lộ trình \"tay trái hái ra tiền\" thì inbox mình gửi tài liệu nhé!',
      hashtags: ['#Gemral', '#DaDangHoaThuNhap', '#TaiChinhCaNhan', '#SideHustle', '#KiemTienOnline'],
    },
    {
      content: '🎯 HIGH-TICKET AFFILIATE: TẠI SAO NÊN CHỌN NGÁCH NÀY?\n\nThay vì bán 1000 đơn hàng giá 50k để kiếm 5 triệu, tại sao không bán 1 đơn hàng giá 50 triệu để kiếm 5 triệu (hoặc hơn)?\n\nCông sức chăm sóc 1 khách hàng mua cái áo thun và 1 khách hàng đầu tư gói tài chính... thực ra không chênh lệch nhau quá nhiều về thời gian, nhưng chênh lệch cực lớn về **tư duy** và **kỹ năng**.\n\nLàm High-Ticket (Sản phẩm giá trị cao) giúp bạn:\n1. Nâng tầm bản thân: Bạn phải giỏi, phải sang, phải hiểu biết mới nói chuyện được với người giàu.\n2. Mở rộng Network chất lượng: Khách hàng của bạn là những người thành đạt.\n3. Tối ưu thời gian: Làm ít hơn, thu nhập cao hơn.\n\nTại Gem Capital, chúng mình tập trung vào High-Ticket. Đây là sân chơi dành cho những ai muốn nâng cấp vị thế của mình. Bạn đã sẵn sàng bước ra khỏi vùng an toàn của những đơn hàng lặt vặt chưa?',
      hashtags: ['#Gemral', '#HighTicket', '#TuDuyTrieuPhu', '#NangTamBanThan', '#DoiTacChienLuoc'],
    },
    {
      content: '💡 CÂU CHUYỆN THÀNH CÔNG: TỪ MẸ BỈM SỮA ĐẾN MASTER PARTNER\n\n(Câu chuyện có thật trong team, mình xin phép giấu tên)\n\nChị ấy tìm đến mình khi đang stress nặng vì thất nghiệp ở nhà chăm con, kinh tế phụ thuộc chồng. Chị ấy thích đá phong thủy nhưng không có tiền nhập hàng.\n\nMình bảo: \"Chị không cần nhập hàng. Chị hãy chia sẻ hành trình chữa lành của chị với viên đá thạch anh tím em tặng chị\".\n\nChị ấy bắt đầu viết. Những bài viết vụng về nhưng chân thật. Chị kể về những đêm mất ngủ, về sự an yên khi thiền định. Dần dần, các mẹ bỉm khác đồng cảm. Họ hỏi chị cách vượt qua. Chị giới thiệu các giải pháp của Yinyang Masters và Gemral.\n\nTháng đầu tiên: 2 triệu tiền hoa hồng. Không nhiều, nhưng đủ tiền bỉm sữa.\nTháng thứ 6: Chị ấy trở thành Master Partner với thu nhập 8 con số. Quan trọng hơn, chị ấy tự tin, xinh đẹp và được chồng tôn trọng.\n\nPhụ nữ à, độc lập tài chính là con đường ngắn nhất dẫn đến hạnh phúc tự thân. Đừng ngại bắt đầu!',
      hashtags: ['#Gemral', '#PhuNuKhoiNghiep', '#MeBimSuaKiemTien', '#CauChuyenTruyenCamHung', '#ThanhCong'],
    },
    {
      content: '❓ Q&A: \"EM KHÔNG CÓ NHIỀU BẠN BÈ TRÊN FACEBOOK, LÀM SAO BÁN?\"\n\nĐừng lo! Số lượng bạn bè không quan trọng bằng chất lượng kết nối.\n\nThay vì cố gắng kết bạn bừa bãi, hãy tham gia vào các Group, Cộng đồng (như Gemral này chẳng hạn), nơi tập trung những người có cùng tần số.\n\n- Hãy comment dạo có tâm.\n- Hãy đăng bài chia sẻ giá trị.\n- Hãy giúp đỡ người khác giải đáp thắc mắc.\n\nKhi bạn trở thành một thành viên tích cực và có giá trị, người ta sẽ tự mò vào tường nhà bạn xem bạn là ai, bạn làm gì. Đó là cách hút Traffic tự nhiên và chất lượng nhất.\n\n\"Hữu xạ tự nhiên hương\". Hãy biến mình thành bông hoa thơm, ong bướm sẽ tự tìm đến.',
      hashtags: ['#Gemral', '#XayDungThuongHieu', '#TrafficSach', '#KinhNghiemThucChien', '#HoiDap'],
    },
    {
      content: '🔥 NĂNG LƯỢNG CAO = THU NHẬP CAO\n\nBạn có để ý không? Không ai muốn mua hàng từ một người ủ rũ, than vãn, tiêu cực cả.\n\nNgười ta thích mua hàng từ những người vui vẻ, năng lượng, tích cực. Bởi vì họ tin rằng khi mua món đồ đó, họ cũng sẽ được \"lây\" cái năng lượng tích cực đó.\n\nVì vậy, trước khi học kỹ năng chốt sale, hãy học cách quản trị năng lượng của bản thân:\n- Giữ sức khỏe.\n- Thiền định để tâm an.\n- Luôn mỉm cười và biết ơn.\n- Dùng ngôn từ tích cực.\n\nKhi tần số rung động của bạn cao, bạn sẽ thu hút những khách hàng hào phóng, dễ tính. Khi tần số bạn thấp, bạn toàn gặp khách bom hàng, kì kèo.\n\nMuốn ví dày, hãy giữ cho tâm sáng và năng lượng tràn đầy nhé! ⚡️',
      hashtags: ['#Gemral', '#LuatHapDan', '#NangLuongGoc', '#BanHangBangTam', '#HighVibe'],
    },
    {
      content: '📊 BÍ MẬT CỦA CON SỐ 80/20 TRONG KINH DOANH\n\nQuy luật Pareto luôn đúng: 80% thu nhập của bạn sẽ đến từ 20% khách hàng (hoặc 20% sản phẩm).\n\nThay vì chạy theo số đông và bán những món lợi nhuận thấp, hãy tập trung chăm sóc thật kỹ nhóm 20% khách hàng VIP - những người có khả năng chi trả cao và trung thành.\n\nTại hệ sinh thái Gemral, chúng tôi thiết kế sẵn các sản phẩm phễu để bạn lọc ra nhóm 20% tinh hoa này. Việc của bạn là nhận diện họ, chăm sóc họ như người thân, và cung cấp cho họ những giải pháp cao cấp nhất.\n\nLàm ít hơn, chất lượng hơn. Đó là cách người giàu làm việc. Bạn đã xác định được nhóm 20% của mình chưa?',
      hashtags: ['#Gemral', '#Pareto', '#ChienLuocKinhDoanh', '#ToiUuHoa', '#SmartWork'],
    },
    {
      content: '🤝 SỨC MẠNH CỦA ĐỘI NHÓM (TEAMWORK)\n\n\"Muốn đi nhanh thì đi một mình, muốn đi xa thì đi cùng nhau\".\n\nLàm Affiliate không có nghĩa là bạn phải đơn độc. Tại Gemral, chúng ta có văn hóa hỗ trợ chéo. Người đi trước dìu dắt người đi sau. Người giỏi kỹ thuật hỗ trợ người giỏi nội dung.\n\nKhi bạn xây dựng được một team CTV bên dưới mình:\n- Bạn có động lực để làm gương.\n- Bạn được hưởng cộng hưởng doanh số.\n- Bạn học được kỹ năng lãnh đạo.\n\nĐừng chỉ là một người bán hàng. Hãy định vị mình là một Leader. Hãy bắt đầu tìm kiếm những người đồng đội đầu tiên ngay hôm nay. Tag người bạn muốn rủ làm cùng vào đây nào! 👇',
      hashtags: ['#Gemral', '#Teamwork', '#LanhDao', '#XayDungDoiNhom', '#CungNhauPhatTrien'],
    },
    {
      content: '📱 CONTENT IS KING - NHƯNG CONTEXT IS QUEEN\n\nNội dung hay là chưa đủ, nó phải đặt đúng bối cảnh.\n\n- Đăng bài triết lý sâu sắc vào lúc 12h đêm (khi người ta đang tâm trạng) sẽ hiệu quả hơn đăng vào 8h sáng (khi người ta đang vội đi làm).\n- Đăng feedback khách hàng vào giờ nghỉ trưa.\n- Livestream vào giờ vàng buổi tối.\n\nHãy quan sát hành vi của tệp khách hàng bạn hướng tới. Họ online giờ nào? Họ thích đọc dài hay xem video ngắn? Họ thích nghe kể chuyện hay thích số liệu?\n\nHiểu khách hàng là chìa khóa của mọi chiến dịch Marketing. Chịu khó quan sát một chút, kết quả sẽ khác biệt ngay.',
      hashtags: ['#Gemral', '#MarketingTips', '#ContentStrategy', '#ThauHieuKhachHang', '#KinhDoanhThucChien'],
    },
    {
      content: '🎁 QUÀ TẶNG: EBOOK \"7 BƯỚC XÂY DỰNG CỖ MÁY KIẾM TIỀN TỰ ĐỘNG TỪ SỐ 0\"\n\nMình vừa biên soạn xong tài liệu này, đúc kết từ kinh nghiệm thực chiến của bản thân và các Top Partner tại Gemral. Trong này có:\n- Cách chọn ngách phù hợp.\n- Mẫu kịch bản tư vấn chốt sale tỉ lệ cao.\n- Cách xử lý từ chối khéo léo.\n\nTài liệu này lưu hành nội bộ và mình muốn dành tặng cho 10 bạn cam kết nghiêm túc muốn thay đổi thu nhập trong tháng này.\n\nComment \"TÔI MUỐN\" + tag 2 người bạn quan tâm để nhận link tải nhé. Số lượng có hạn!',
      hashtags: ['#Gemral', '#QuaTang', '#EbookMienPhi', '#KienThucKinhDoanh', '#HanhDongNgay'],
    },
    {
      content: '🌟 LỜI KHUYÊN CUỐI NGÀY: HÃY BẮT ĐẦU TRƯỚC KHI BẠN SẴN SÀNG\n\nBạn đợi hoàn hảo mới làm? Bạn sẽ đợi đến hết đời.\n- Đợi có máy ảnh xịn mới quay video?\n- Đợi viết văn hay mới đăng bài?\n- Đợi hiểu hết 100% sản phẩm mới dám tư vấn?\n\nSai lầm! Hành động tạo ra sự rõ ràng. Cứ làm đi, sai thì sửa. Video đầu tiên sẽ dở tệ, bài viết đầu tiên sẽ ít like. Không sao cả. Ai cũng phải bắt đầu từ đâu đó.\n\nThầy của mình từng nói: \"Phiên bản lỗi còn hơn là không có phiên bản nào\".\n\nHãy cho phép bản thân được dở, để sau này được giỏi. Bắt tay vào làm ngay một việc nhỏ nhất cho mục tiêu kinh doanh của bạn hôm nay đi nào!\n\nGood night cả nhà! 🌙',
      hashtags: ['#Gemral', '#Motivation', '#JustDoIt', '#PhatTrienBanThan', '#LoiKhuyen'],
    },
    {
      content: '🧮 BÀI TOÁN THU NHẬP: LÀM SAO ĐỂ CÓ 20 TRIỆU/THÁNG MÀ KHÔNG CẦN VỐN?\n\nNhiều bạn CTV mới vào hay bị ngợp. Để mình tính thử cho các bạn thấy nó khả thi thế nào nhé.\n\nMục tiêu: 20.000.000đ/tháng.\nCách làm:\n1. Tập trung bán gói **Tier 1 (11 triệu)** - Gói này dễ bán nhất cho người mới bắt đầu trading.\n2. Hoa hồng (Cấp Beginner 10%): 1.100.000đ x 5 khách = 5.500.000đ.\n3. **QUAN TRỌNG NHẤT - BONUS KPI:** Đạt 5 học viên Trading -> Thưởng nóng **5.000.000đ**.\n\n👉 Tổng: 10.5 triệu. (Mới được một nửa).\n\nĐể đạt 20 triệu, bạn chỉ cần nỗ lực gấp đôi: Tìm 9-10 khách/tháng. Hoặc kết hợp bán thêm:\n- 25 khóa \"Tần số tình yêu\" (399k) -> Hoa hồng + Bonus 250k.\n- Vài vật phẩm đá thạch anh.\n\nTại Gemral, tiền không nằm ở việc bán nhiều, mà nằm ở việc **đạt mốc KPI**. Hãy nhắm thẳng vào các mốc thưởng nóng (5M, 7M, 10M, 20M) mà chạy!',
      hashtags: ['#Gemral', '#BaiToanThuNhap', '#KPIBonus', '#ChienLuocKinhDoanh', '#KiemTienOnline'],
    },
    {
      content: '🤖 TẠI SAO GÓI \"TIER 3\" (68 TRIỆU) LẠI LÀ GÓI ĐẦU TƯ KHÔN NGOAN NHẤT?\n\nKhách hàng thường sốc khi nghe giá 68 triệu. Nhưng hãy phân tích cho họ thấy:\n\n- Gói lẻ: Scanner (6tr) + Chatbot (Unlimited) mua rời trong 2 năm sẽ tốn hơn 100 triệu.\n- Gói Tier 3: Trọn gói 2 năm chỉ 68 triệu. **Tiết kiệm gần 40%**.\n\nĐây là gói dành cho những Trader xác định đi đường dài (Career Trader). Khi bạn bán được 1 gói này:\n- Bạn giúp khách hàng tiết kiệm cả đống tiền công cụ.\n- Bạn (nếu là Grand Partner) nhận hoa hồng **20.400.000đ** (30%).\n\nBán 1 đơn bằng người khác đi làm cả 2 tháng. Tại sao không dám thử tư vấn gói VIP?',
      hashtags: ['#Gemral', '#HighTicketSales', '#PhanTichDauTu', '#Tier3', '#LoiIchKhachHang'],
    },
    {
      content: '❤️ KHÓA HỌC \"TẦN SỐ TÌNH YÊU\" (399K) - MỒI CÂU SIÊU NHẠY\n\nĐừng coi thường khóa học 399k này. Đây là vũ khí bí mật để bạn tiếp cận tệp khách hàng nữ đông đảo.\n\nChiến lược:\n1. Đăng bài về chữa lành mối quan hệ, thu hút người yêu cũ... -> Bán khóa 399k.\n2. Khách học xong thấy hay, tin tưởng -> Mời vào nhóm VIP.\n3. Upsell (Bán thêm): \"Chị ơi, để tình yêu bền vững thì tài chính phải vững. Chị tham khảo thêm khóa Tái tạo tư duy triệu phú (499k) hoặc đầu tư đá phong thủy trợ duyên nhé\".\n\nTừ 399k lên đơn hàng vài triệu rất dễ. Hãy dùng sản phẩm giá rẻ để xây dựng niềm tin (Trust) trước.',
      hashtags: ['#Gemral', '#PhieuBanHang', '#TanSoTinhYeu', '#ChienLuocMoiCau', '#Upsell'],
    },
    {
      content: '📉 TRADING KHÔNG PHẢI ĐÁNH BẠC - NẾU CÓ CÔNG CỤ\n\nNhiều người sợ trading vì sợ mất tiền. Đúng, nếu trade bằng \"cảm giác\" thì là đánh bạc.\n\nNhưng Gemral cung cấp:\n- **Phương pháp Frequency Trading:** Giao dịch dựa trên tần số năng lượng và kỹ thuật.\n- **Scanner & Chatbot:** Công cụ báo tín hiệu tự động, loại bỏ cảm xúc fomo.\n\nKhi làm Affiliate cho mảng Trading của Gemral, hãy nhấn mạnh vào **SỰ AN TOÀN** và **CÔNG CỤ HỖ TRỢ**. Chúng ta bán giải pháp đầu tư khoa học, không bán mộng làm giàu nhanh.\n\nBạn đã trải nghiệm thử con Bot của Gemral chưa? Phê lắm đấy!',
      hashtags: ['#Gemral', '#TradingTools', '#DauTuAnToan', '#CongNghe', '#Fintech'],
    },
    {
      content: '🎓 MENTOR - NGHỀ NGHIỆP DANH GIÁ TẠI GEMRAL\n\nBạn có biết ở Gemral, nấc thang cao nhất không phải là \"Siêu Best Seller\" mà là **Mentor/Trainer**?\n\nQuyền lợi của Mentor:\n- Lương cứng 15-40 triệu (ổn định).\n- Ăn chia 10-15% trên mỗi học viên mình dạy.\n- Hưởng 30% phí bản quyền content.\n\nĐiều kiện: Winrate 75%+. Khó không? Khó. Nhưng xứng đáng.\nNếu bạn là một Trader giỏi nhưng đang cô đơn, hãy về với Gemral. Chúng tôi có sẵn học viên, sẵn giáo trình, bạn chỉ việc tỏa sáng trên bục giảng.\n\nHành trình từ Zero đến Mentor đang chờ bạn.',
      hashtags: ['#Gemral', '#CareerPath', '#Mentor', '#TuyenDungTrader', '#ThuNhapThuDong'],
    },
    {
      content: '💎 ẨN LONG THẠCH & NGỰ LINH THẠCH: BỘ ĐÔI \"HÚT KHÁCH\" SANG CHẢNH\n\nKhách hàng doanh nhân không mua đá lẻ. Họ mua \"Trận đồ năng lượng\".\n\nHai set đá này của Yinyang Masters được thiết kế riêng cho giới chủ:\n- **Ẩn Long Thạch:** Có vàng găm, thạch anh vàng hiếm -> Kích hoạt dòng tiền ngầm, giữ tiền.\n- **Ngự Linh Thạch:** Đủ ngũ hành, trấn trạch -> Bình ổn nhân sự, gia đạo.\n\nHoa hồng cho các set này lên tới 15%. Bán một set vài triệu, hoa hồng tiền trăm, lại được tiếng thơm là tư vấn có tâm. Hãy học thuộc công năng của 2 bộ này nhé, \"best seller\" đấy!',
      hashtags: ['#Gemral', '#DaPhongThuy', '#VatPhamDoanhNhan', '#YinyangMasters', '#BanHangGiaTriCao'],
    },
    {
      content: '📊 KHOA HỌC CỦA SỰ THỊNH VƯỢNG: TÁI TẠO TƯ DUY (499K)\n\nTại sao có người làm hoài không giàu? Vì \"nhiệt kế tài chính\" trong tâm thức họ bị cài đặt ở mức thấp.\n\nKhóa học **\"Tái tạo tư duy triệu phú\"** (499k) không dạy cách kiếm tiền, mà dạy cách **sửa lỗi tư duy**.\n\nĐây là khóa học bạn nên bán cho chính những người đang làm hệ thống cùng bạn, hoặc những khách hàng đang bế tắc tài chính. Khi tư duy thông suốt, họ sẽ tự biết cách kiếm tiền (và sẽ quay lại cảm ơn bạn, mua thêm các gói đầu tư khác).\n\nBán hàng là giáo dục (Selling is Educating).',
      hashtags: ['#Gemral', '#TuDuyTrieuPhu', '#GiaoDucTaiChinh', '#KhoaHocMindset', '#ThayDoiTuDuy'],
    },
    {
      content: '⚡️ \"TẦN SỐ GỐC\" - KHÓA HỌC CHUYỂN HÓA SÂU SẮC NHẤT\n\nGiá 1.990.000đ cho 7 ngày thay đổi cuộc đời. Đắt hay rẻ?\n\nRất rẻ nếu bạn biết nó giúp:\n- Khai mở trực giác.\n- Kết nối lại với chính mình.\n- Xử lý các tổn thương gốc rễ.\n\nVới mức Bonus KPI: **Đạt 10 học viên -> Thưởng thêm 500k** (ngoài hoa hồng). Đây là sản phẩm chủ lực để bạn xây dựng tệp khách hàng trung thành (Loyal Fan). Những người học xong khóa này thường sẽ trở thành Partner hoặc khách hàng VIP trọn đời vì họ đã \"thấm\" triết lý của Jennie.',
      hashtags: ['#Gemral', '#TanSoGoc', '#ChuaLanh', '#PhatTrienTamLinh', '#KhoaHocChatLuong'],
    },
    {
      content: '🚀 ĐỪNG ĐỂ TIỀN RƠI: TỐI ƯU HÓA BONUS KPI\n\nMẹo nhỏ cho các Partner:\nCuối tháng, hãy check lại số lượng đơn hàng.\n- Bạn đã bán được 4 gói Trading? Hãy cố gắng chốt thêm 1 gói nữa để lấy Bonus 5 TRIỆU.\n- Bạn đã có 24 học viên khóa Tình Yêu? Hãy rủ thêm 1 người bạn học để cán mốc 25 và nhận thưởng.\n\nĐừng dừng lại ở con số 4 hay 24. Chỉ thêm một chút nỗ lực, phần thưởng sẽ tăng vọt. Kinh doanh là phải biết tính toán điểm rơi phong độ!',
      hashtags: ['#Gemral', '#MeoKinhDoanh', '#ToiUuLoiNhuan', '#ChaySoCuoiThang', '#SmartWorking'],
    },
    {
      content: '🌐 CƠ HỘI TOÀN CẦU VỚI CRYPTO TRADING\n\nThị trường Crypto không ngủ và không biên giới. Khách hàng của bạn có thể là người Việt ở Mỹ, ở Nhật, ở Úc.\n\nCác gói khóa học và công cụ của Gemral là sản phẩm số (Digital Products), bạn có thể bán cho bất kỳ ai trên thế giới mà không tốn phí ship.\n\nHãy mở rộng tư duy. Đừng chỉ quanh quẩn bán cho hàng xóm. Hãy dùng Facebook, TikTok để tiếp cận cộng đồng người Việt hải ngoại. Nhu cầu kiếm tiền thụ động và học đầu tư của họ cực lớn.',
      hashtags: ['#Gemral', '#GlobalMarket', '#DigitalProducts', '#CryptoTrading', '#CoHoiToanCau'],
    },
    {
      content: '🎭 ĐỪNG CỐ GẮNG TRỞ THÀNH NGƯỜI KHÁC, HÃY LÀ PHIÊN BẢN TỐT NHẤT CỦA CHÍNH MÌNH\n\nKhi mới làm Affiliate, sai lầm lớn nhất của mình là cố bắt chước các \"idol\". Thấy họ viết dài, mình cũng viết dài. Thấy họ quay video sang chảnh, mình cũng cố thuê studio.\n\nKết quả? Thất bại thảm hại vì nó... \"giả trân\". Khách hàng tinh lắm, họ ngửi thấy mùi \"diễn\" ngay.\n\nSau đó mình quay về làm đúng con người mình:\n- Mình thích hài hước -> Viết content kiểu tếu táo, vui vẻ.\n- Mình thích đơn giản -> Quay video bằng điện thoại, mặt mộc, chia sẻ chân thật.\n\nTự nhiên tương tác tăng vọt. Khách hàng mua vì họ thích cái \"chất\" riêng đó. Họ mua vì tin vào sự chân thật.\n\nTrong hệ sinh thái Gemral, chúng tôi có đủ công cụ hỗ trợ, nhưng \"màu sắc\" là do bạn tự tô vẽ. Đừng làm bản sao của ai cả, hãy làm bản chính của cuộc đời mình. \n\nBạn thuộc team nào: Hài hước, Sâu sắc, hay Thẳng thắn? Comment cho mình biết nhé! 👇',
      hashtags: ['#Gemral', '#ThuongHieuCaNhan', '#BeYourself', '#AffiliateMarketing', '#ChanThat'],
    },
    {
      content: '🚫 KHI KHÁCH HÀNG NÓI \"KHÔNG\", ĐÓ MỚI LÀ LÚC CUỘC BÁN HÀNG BẮT ĐẦU\n\n\"Em ơi giá cao quá\", \"Để chị suy nghĩ thêm\", \"Anh chưa cần bây giờ\"...\n\nNghe quen không? 90% người mới sẽ nản lòng và bỏ cuộc ngay lúc này. Nhưng với dân Pro, đây là tín hiệu để bắt đầu \"xử lý từ chối\".\n\n- Giá cao? -> Hãy phân tích giá trị. Một viên đá năng lượng dùng cả đời so với một bữa nhậu, cái nào đắt hơn?\n- Suy nghĩ thêm? -> Hỏi khéo xem họ đang băn khoăn điều gì cụ thể. Có khi họ chỉ cần một lời cam kết hoặc một feedback từ người dùng khác.\n\nĐừng sợ từ chối. Từ chối nghĩa là họ quan tâm nhưng chưa đủ thông tin hoặc niềm tin. Hãy kiên nhẫn cung cấp thêm giá trị, đừng ép họ chốt đơn. Hãy làm bạn trước, bán hàng sau.\n\nAi từng bị từ chối \"sấp mặt\" mà sau này khách đó lại quay lại mua nhiều nhất không? Kể nghe chơi! 😅',
      hashtags: ['#Gemral', '#XuLyTuChoi', '#KyNangSale', '#TamLyKhachHang', '#KienTri'],
    },
    {
      content: '🎯 CHỌN NGÁCH (NICHE) HAY LÀ CHẾT?\n\n\"Cái gì cũng bán\" = \"Không bán được gì cả\".\n\nGemral có rất nhiều sản phẩm: từ đá phong thủy, vật phẩm tâm linh đến khóa học tài chính. Nếu bạn đăng thập cẩm lên Facebook, tường nhà bạn sẽ trông như cái tạp hóa lộn xộn.\n\nHãy chọn một ngách để trở thành chuyên gia:\n- Bạn thích chữa lành? Tập trung vào bộ sản phẩm đá thạch anh, nến thơm, khóa học thiền.\n- Bạn thích đầu tư? Tập trung vào các gói hợp tác, kiến thức tài chính.\n\nKhi bạn định vị rõ ràng, khách hàng sẽ nhớ đến bạn đầu tiên khi họ có nhu cầu. \"Muốn mua đá xịn? Tìm bà A\". \"Muốn học đầu tư? Tìm ông B\".\n\nĐó gọi là Top of Mind. Bạn đã chọn được ngách cho mình chưa?',
      hashtags: ['#Gemral', '#ChonNgach', '#DinhViBanThan', '#ChuyenGia', '#AffiliateStrategy'],
    },
    {
      content: '🕰 QUẢN LÝ THỜI GIAN CHO DÂN \"2 TAY 2 SÚNG\"\n\nLàm sao để vừa đi làm hành chính 8 tiếng, vừa chăm con, vừa làm Affiliate kiếm thêm ngàn đô?\n\nBí mật là sự TẬP TRUNG (Focus), không phải là làm nhiều giờ hơn.\n\nCông thức của mình:\n- 30 phút sáng sớm: Đăng bài tương tác (lúc này não thông thoáng, viết hay nhất).\n- Giờ nghỉ trưa: Trả lời comment, inbox tư vấn (tranh thủ lúc mọi người online).\n- 1 tiếng buổi tối: Học thêm kiến thức sản phẩm hoặc xem video đào tạo của Gemral.\n\nChỉ cần 2-3 tiếng chất lượng mỗi ngày, đều đặn như vắt chanh, kết quả sẽ đến. Đừng lấy lý do \"bận\" để biện hộ cho sự lười biếng. Ai cũng có 24h thôi.\n\nBạn dành bao nhiêu thời gian mỗi ngày cho công việc kinh doanh này?',
      hashtags: ['#Gemral', '#QuanLyThoiGian', '#HieuSuat', '#KyLuat', '#SideJob'],
    },
    {
      content: '📚 \"BÁN CÁI MÌNH CÓ HAY BÁN CÁI KHÁCH CẦN?\"\n\nCâu trả lời là: Bán cái khách cần, nhưng phải là cái mình hiểu rõ nhất.\n\nTại Gemral, chúng mình luôn tổ chức các buổi training đào tạo sản phẩm rất kỹ. Tại sao? Vì bạn không thể bán một viên đá nếu không biết công dụng của nó. Bạn không thể tư vấn gói đầu tư nếu không hiểu cơ chế dòng tiền.\n\nSự thiếu hiểu biết là kẻ thù của doanh số. Khi khách hỏi mà bạn ú ớ, niềm tin sẽ bay biến.\n\nDành thời gian đọc tài liệu, xem video review, thậm chí là trải nghiệm sản phẩm. Khi bạn có kiến thức, lời nói của bạn sẽ có trọng lượng (Authority). Lúc đó, bạn không cần bán, khách tự nghe theo.\n\nHôm nay bạn đã nạp thêm kiến thức gì mới chưa?',
      hashtags: ['#Gemral', '#KienThucSanPham', '#ChuyenGia', '#TuVanTanTam', '#HocTapLienTuc'],
    },
    {
      content: '📝 CONTENT KỂ CHUYỆN (STORYTELLING) - VŨ KHÍ BÍ MẬT\n\nĐừng đăng: \"Viên đá này giá 500k, công dụng thu hút tài lộc. Mua ngay!\"\n\nHãy đăng: \"Tháng trước mình stress vì công việc không như ý, doanh số tụt giảm. Mình đã thử đặt một viên thạch anh vàng lên bàn làm việc và thực hành thiền biết ơn mỗi sáng. Không biết có phải trùng hợp không, nhưng tâm mình tĩnh lại, mình nhìn thấy cơ hội trong khó khăn. Hôm qua, mình vừa chốt được hợp đồng lớn nhất từ trước đến nay...\"\n\nCon người kết nối qua những câu chuyện. Hãy kể về sự thay đổi, về cảm xúc, về hành trình. Câu chuyện chạm đến trái tim thì ví tiền sẽ tự mở.\n\nBạn có câu chuyện nào hay ho về trải nghiệm của bản thân hoặc khách hàng không? Chia sẻ ngay nhé, đó là content triệu đô đấy!',
      hashtags: ['#Gemral', '#Storytelling', '#ContentMarketing', '#VietContent', '#CamXuc'],
    },
    {
      content: '🤝 XÂY DỰNG NIỀM TIN TRONG THẾ GIỚI ẢO\n\nTrên mạng, ai cũng có thể là bất kỳ ai. Vậy làm sao để khách hàng tin và chuyển tiền cho một người lạ như bạn?\n\n1. **Minh bạch:** Thông tin cá nhân rõ ràng, ảnh thật, tên thật. Đừng để avatar chó mèo hay tên nick ảo.\n2. **Hiện diện:** Xuất hiện đều đặn. Hôm nay đăng, mai lặn mất tăm thì ai dám tin?\n3. **Nhất quán:** Nói được làm được. Đừng hôm nay bán đá, mai bán kem trộn, kia bán bảo hiểm. Hãy xây dựng hình ảnh chuyên gia trong một lĩnh vực.\n4. **Feedback:** Khoe những phản hồi thật của khách hàng (nhớ che tên nếu cần). Đây là bằng chứng thép.\n\nNiềm tin xây ngàn ngày, mất một giờ. Hãy giữ uy tín như giữ vàng nhé các Partner của Gemral!',
      hashtags: ['#Gemral', '#UyTin', '#XayDungNiemTin', '#PersonalBrand', '#KinhDoanhOnline'],
    },
    {
      content: '🐢 CHẬM LẠI MỘT CHÚT ĐỂ ĐI XA HƠN\n\nCó những ngày mình không bán được đơn nào. Có những tuần doanh số về 0. Lúc đó, mình hoang mang lắm.\n\nNhưng Mentor của mình bảo: \"Cây tre mất 4 năm chỉ để mọc 3cm, nhưng từ năm thứ 5 nó cao thêm 30cm mỗi ngày. Giai đoạn đầu là giai đoạn phát triển bộ rễ\".\n\nKinh doanh cũng vậy. Những lúc không ra đơn là lúc bạn đang tích lũy: tích lũy kiến thức, tích lũy mối quan hệ, tích lũy thương hiệu. Đừng bỏ cuộc khi bộ rễ chưa đủ sâu.\n\nHãy kiên trì. Giữ vững niềm tin vào con đường mình chọn. Rồi sẽ đến ngày bạn bùng nổ như cây tre kia.\n\nAi đang trong giai đoạn \"mọc rễ\" điểm danh để chúng mình cùng động viên nhau nào! 🌱',
      hashtags: ['#Gemral', '#KienTri', '#DongLuc', '#PhatTrienBenVung', '#TreXanh'],
    },
    {
      content: '🆘 KHI NÀO CẦN TÌM NGƯỜI DẪN ĐƯỜNG (MENTOR)?\n\nLàm một mình thì tự do, nhưng dễ lạc lối. Làm cùng Mentor thì có kỷ luật, nhưng đi đúng hướng.\n\nTại Gemral, chúng tôi có văn hóa Mentor-Mentee. Những người đi trước, đã có thành tựu, sẽ cầm tay chỉ việc cho người mới. Không giấu nghề, không mánh khóe.\n\nTại sao họ làm vậy? Vì thành công của bạn cũng là thành công của họ (cơ chế cộng hưởng).\n\nNếu bạn đang loay hoay không biết bắt đầu từ đâu, đừng ngại inbox cho người đã giới thiệu bạn vào đây, hoặc các Admin. Hãy hỏi, hãy học, hãy xin được giúp đỡ. Đó là đường tắt nhanh nhất để thành công.\n\n\"Muốn đi nhanh hãy đi một mình, muốn đi xa hãy đi cùng nhau\".',
      hashtags: ['#Gemral', '#Mentorship', '#NguoiDanDuong', '#HocHoi', '#Teamwork'],
    },
    {
      content: '🧠 TƯ DUY VỀ TIỀN: BẠN SỢ TIỀN HAY YÊU TIỀN?\n\nNhiều người miệng nói muốn giàu, nhưng trong tiềm thức lại sợ tiền, ghét người giàu, nghĩ rằng \"tiền bạc là nguồn gốc mọi tội lỗi\".\n\nNếu bạn ghét tiền, tiền sẽ không đến với bạn đâu. Hãy thay đổi tư duy:\n- Tiền là công cụ để tự do.\n- Tiền giúp mình chăm sóc gia đình tốt hơn.\n- Tiền giúp mình làm từ thiện, giúp đỡ cộng đồng.\n\nKhi bạn kinh doanh các sản phẩm giá trị cao (High-ticket) tại Gemral, bạn cần làm quen với những con số lớn. Đừng run sợ khi nói về tiền trăm triệu, tiền tỷ. Hãy coi đó là giá trị bạn mang lại cho khách hàng.\n\nHãy yêu tiền một cách lành mạnh và trí tuệ. Tiền sẽ yêu lại bạn. 💸❤️',
      hashtags: ['#Gemral', '#MoneyMindset', '#TuDuyThinhVuong', '#LuatHapDan', '#TaiChinh'],
    },
    {
      content: '🕸 NETWORKING: TÀI SẢN VÔ HÌNH LỚN NHẤT\n\n\"Quan hệ sinh ra tiền tệ\". Câu này chưa bao giờ sai.\n\nLàm Đối tác kinh doanh không chỉ là bán hàng, mà là cơ hội để bạn kết giao với những người chất lượng. Trong cộng đồng Gemral có ai?\n- Các nhà đầu tư lão luyện.\n- Các chuyên gia phong thủy, tâm linh.\n- Các chủ doanh nghiệp, KOLs.\n\nHãy tích cực giao lưu, comment, hỗ trợ nhau. Một mối quan hệ chất lượng hôm nay có thể mang lại cơ hội hợp tác lớn ngày mai. Đừng chỉ núp trong bóng tối, hãy bước ra ánh sáng và kết nối.\n\nBạn đã làm quen được bao nhiêu người bạn mới trong group này rồi?',
      hashtags: ['#Gemral', '#Networking', '#KetNoi', '#MoiQuanHe', '#CoHoi'],
    },
    {
      content: '💖 CHĂM SÓC KHÁCH HÀNG: BÍ QUYẾT GIỮ CHÂN \"THƯỢNG ĐẾ\"\n\nBán xong đơn hàng là xong? Sai lầm!\n\nBán xong mới là lúc bắt đầu mối quan hệ. Hãy nhắn tin hỏi thăm:\n- \"Chị nhận được đá chưa, có thấy ưng ý không?\"\n- \"Anh đầu tư rồi có thắc mắc gì về báo cáo hàng tuần không?\"\n- Gửi lời chúc mừng sinh nhật, lễ tết.\n\nChăm sóc khách hàng cũ tốn ít chi phí hơn 5-7 lần so với tìm khách mới. Và khách hàng cũ hài lòng sẽ là kênh Marketing 0 đồng hiệu quả nhất của bạn.\n\nHãy phục vụ bằng cái tâm. Khách hàng sẽ trả lại bằng cái tình (và tiền).',
      hashtags: ['#Gemral', '#CustomerService', '#ChamSocKhachHang', '#TanTam', '#LongTrungThanh'],
    },
    {
      content: '🔥 BURNOUT (KIỆT SỨC): KẺ THÙ THẦM LẶNG CỦA DÂN MMO\n\nLàm online dễ bị cuốn. Cầm điện thoại 24/7, check noti liên tục, áp lực doanh số... Dễ dẫn đến stress và kiệt sức.\n\nHãy nhớ: Chúng ta làm việc để sống hạnh phúc, không phải sống để làm việc đến chết.\n\n- Đặt giới hạn thời gian online.\n- Dành thời gian thiền, tập thể dục, kết nối với thiên nhiên (cầm viên đá năng lượng ra công viên ngồi chẳng hạn).\n- Tự thưởng cho bản thân sau mỗi mục tiêu đạt được.\n\nMột cái đầu tỉnh táo và một cơ thể khỏe mạnh mới kiếm được nhiều tiền. Đừng để ngọn lửa đam mê thiêu rụi chính mình nhé.\n\nCuối tuần rồi, xả hơi chút đi các chiến binh!',
      hashtags: ['#Gemral', '#Burnout', '#CanBangCuocSong', '#SucKhoeTinhThan', '#WorkLifeBalance'],
    },
    {
      content: '🎉 CELEBRATE SMALL WINS: ĂN MỪNG CHIẾN THẮNG NHỎ\n\nĐừng đợi đến khi kiếm được 1 tỷ mới ăn mừng. Hãy ăn mừng ngay khi:\n- Có khách hàng đầu tiên nhắn tin hỏi (dù chưa mua).\n- Kiếm được 100k hoa hồng đầu tiên.\n- Viết được một bài content hay được nhiều like.\n\nViệc ăn mừng (neo cảm xúc) giúp não bộ tiết ra Dopamine, tạo động lực để bạn đi tiếp. Nó nuôi dưỡng niềm tin rằng \"Mình làm được\".\n\nHôm nay bạn có niềm vui nhỏ nào không? Khoe ngay để cả nhà cùng chúc mừng nào! 🥳',
      hashtags: ['#Gemral', '#DongLuc', '#ChienThangNho', '#TuDuyTichCuc', '#HanhPhuc'],
    },
    {
      content: '❓ HỎI THẬT: TẠI SAO BẠN LẠI BẮT ĐẦU?\n\nKhi gặp khó khăn, chán nản, muốn bỏ cuộc (chắc chắn sẽ có lúc như thế), hãy nhớ lại lý do bạn bắt đầu (Your Why).\n\n- Vì muốn có tiền mua sữa cho con?\n- Vì muốn chứng minh bản thân với gia đình?\n- Vì muốn tự do đi du lịch khắp nơi?\n- Hay vì muốn lan tỏa giá trị tâm linh giúp người?\n\nCái \"Why\" càng lớn, động lực càng mạnh. Hãy viết nó ra, dán lên màn hình máy tính. Nó là ngọn hải đăng dẫn lối cho bạn qua những ngày giông bão.\n\nLý do của bạn là gì? Chia sẻ được không?',
      hashtags: ['#Gemral', '#YourWhy', '#DongLuc', '#KienDinh', '#MucTieu'],
    },
    {
      content: '⚙️ HỆ THỐNG HÓA: BƯỚC NHẢY VỌT TỪ NGHIỆP DƯ LÊN CHUYÊN NGHIỆP\n\nLúc đầu làm thủ công: tự chat, tự note đơn, tự nhớ lịch hẹn. Nhưng khi khách đông lên, bạn sẽ rối tung.\n\nHãy học cách hệ thống hóa:\n- Soạn sẵn các kịch bản tư vấn mẫu (Script) cho từng tình huống. Lưu vào note điện thoại, copy paste cho nhanh.\n- Dùng Excel hoặc App để quản lý danh sách khách hàng.\n- Lên lịch đăng bài tự động.\n\nTại Gemral, chúng tôi cung cấp sẵn các quy trình (SOP) này trong bộ Marketing Kit. Bạn chỉ cần áp dụng. Người thành công là người có quy trình, không phải người làm việc tùy hứng.',
      hashtags: ['#Gemral', '#QuyTrinh', '#HeThongHoa', '#LamViecThongMinh', '#HieuQua'],
    },
    {
      content: '📖 \"LEADERS ARE READERS\" - LÃNH ĐẠO LÀ NGƯỜI HAM ĐỌC\n\nBạn muốn dẫn dắt đội nhóm, muốn khách hàng tin tưởng? Bạn phải có kiến thức rộng hơn họ.\n\nMỗi ngày đọc 10 trang sách. Sách về kinh doanh, tâm lý, tâm linh, đầu tư... Sau 1 năm, bạn đọc được hơn 10 cuốn sách. Kiến thức đó sẽ đi vào lời nói, vào thần thái của bạn.\n\nĐừng chỉ lướt TikTok xem nhảy nhót. Hãy nạp thức ăn bổ dưỡng cho não bộ.\n\nCuốn sách nào đã thay đổi tư duy của bạn? Giới thiệu cho mọi người cùng đọc nhé! 📚',
      hashtags: ['#Gemral', '#DocSach', '#TuHoc', '#PhatTrienTuDuy', '#LanhDao'],
    },
    {
      content: '📢 KÊU GỌI ĐỒNG ĐỘI: TEAM MÌNH CÒN 3 SLOT CẦM TAY CHỈ VIỆC\n\nTháng này, mục tiêu của team mình là giúp 5 bạn mới đạt mốc thu nhập 10 triệu/tháng từ con số 0.\n\nMình đã nhận 2 bạn, còn 3 slot nữa dành cho những ai:\n- Nghiêm túc, cam kết dành ít nhất 2h/ngày.\n- Có tinh thần học hỏi, \"ly nước rỗng\".\n- Yêu thích lĩnh vực đá năng lượng, phong thủy hoặc đầu tư.\n\nQuyền lợi:\n- Được mình coaching 1-1.\n- Được cung cấp toàn bộ tài liệu, hình ảnh, kịch bản.\n- Được tham gia các buổi đào tạo kín của Gemral.\n\nKhông hứa làm giàu nhanh, chỉ hứa làm thật ăn thật. Ai quan tâm inbox mình ngay nhé! Cơ hội không chờ đợi ai.',
      hashtags: ['#Gemral', '#TuyenDung', '#TimDongDoi', '#Coaching', '#CungNhauThanhCong'],
    },
    {
      content: '🔮 TƯƠNG LAI CỦA NGÀNH AFFILIATE & KINH DOANH HỆ THỐNG\n\nThế giới đang thay đổi. AI, Blockchain, Web3 đang định hình lại cách chúng ta kiếm tiền.\n\nNhưng có một thứ máy móc không bao giờ thay thế được: SỰ KẾT NỐI GIỮA NGƯỜI VỚI NGƯỜI.\n\nAffiliate trong tương lai không phải là spam link. Nó sẽ là KOC (Key Opinion Consumer) - Người tiêu dùng có sức ảnh hưởng. Là Trust-based Marketing (Tiếp thị dựa trên niềm tin).\n\nHệ sinh thái Gemral đang đi tiên phong trong việc kết hợp công nghệ và tâm thức. Chúng ta không chỉ kiếm tiền, chúng ta đang xây dựng một cộng đồng thịnh vượng và tỉnh thức.\n\nBạn đã sẵn sàng cho làn sóng mới này chưa? Hay vẫn muốn làm theo cách cũ và bị đào thải?',
      hashtags: ['#Gemral', '#XuHuong', '#TuongLai', '#KOC', '#TrustMarketing'],
    },
    {
      content: '🎁 KẾT THÚC MỘT NGÀY: BIẾT ƠN VÀ BUÔNG BỎ\n\nDù hôm nay bạn chốt được đơn hay không, dù gặp khách dễ thương hay khó tính, hãy kết thúc ngày làm việc bằng lòng biết ơn.\n\n- Biết ơn vì mình có cơ hội để phấn đấu.\n- Biết ơn những bài học từ sự từ chối.\n- Biết ơn những đồng đội luôn hỗ trợ.\n\nBuông bỏ những áp lực, những lo lắng. Reset lại năng lượng để ngày mai bắt đầu một hành trình mới rực rỡ hơn.\n\nChúc cả nhà ngủ ngon và mơ những giấc mơ thịnh vượng! 🌙✨',
      hashtags: ['#Gemral', '#LongBietOn', '#BinhAn', '#KetThucNgay', '#NangLuongTichCuc'],
    },
    {
      content: '👻 KHÁCH HÀNG \"GHOST\" (ĐÃ XEM KHÔNG TRẢ LỜI): XỬ LÝ SAO CHO SANG?\n\nBạn nhắn tin tư vấn nhiệt tình. Khách \"seen\". Rồi im lặng mãi mãi. Cảm giác lúc đó hụt hẫng nhỉ?\n\nĐừng nhắn tiếp: \"Alo chị ơi\", \"Chị còn đó không\". Trông rất tuyệt vọng (desperate).\n\nHãy thử cách này:\n1. **Chờ đợi:** Cho họ không gian. Có thể họ đang bận, đang họp, hoặc cần bàn bạc với vợ/chồng.\n2. **Gửi giá trị (không bán):** 2 ngày sau, gửi một bài viết hay, một video hữu ích liên quan đến vấn đề của họ. \"Chị ơi, em thấy bài viết này nói về đúng vấn đề phong thủy chị đang gặp, chị xem tham khảo nhé\".\n3. **Tâm thế buông bỏ:** Nếu họ vẫn im lặng, hãy chúc họ một ngày tốt lành và move on (đi tiếp). \n\nTrong kinh doanh năng lượng, sự níu kéo tạo ra lực đẩy. Sự tự tin và thấu hiểu tạo ra lực hút. Đừng để một người không trả lời làm tụt mood cả ngày của bạn.',
      hashtags: ['#Gemral', '#XuLyTinhHuong', '#TamLyKhachHang', '#BanHangKhongCheoKeo', '#TuTin'],
    },
    {
      content: '💎 BÁN HÀNG LÀ CHUYỂN GIAO NIỀM TIN\n\nBạn không thể bán một viên đá năng lượng nếu chính bạn không tin vào năng lượng của nó. Bạn không thể mời người khác đầu tư nếu chính bạn còn nghi ngờ về dòng tiền.\n\nKhách hàng có \"giác quan thứ 6\" rất nhạy. Họ cảm nhận được sự do dự trong giọng nói, sự lấp liếm trong câu chữ của bạn.\n\nVì vậy, bước 1 của quy trình bán hàng tại Gemral không phải là \"tìm khách\", mà là \"thuyết phục chính mình\".\n- Hãy trải nghiệm sản phẩm.\n- Hãy soi mói quy trình vận hành.\n- Hãy đặt những câu hỏi khó nhất cho Founder.\n\nKhi niềm tin của bạn đạt 100%, ánh mắt bạn sẽ sáng lên khi nói về sản phẩm. Và chính cái ánh sáng đó sẽ chốt đơn thay cho mọi kịch bản sale.',
      hashtags: ['#Gemral', '#NiemTin', '#AuthenticSelling', '#TraiNghiemSanPham', '#KinhDoanh'],
    },
    {
      content: '🎣 ĐỪNG BÁN CẦN CÂU, HÃY BÁN CẢM GIÁC KHI CÂU ĐƯỢC CÁ\n\nMarketing cơ bản: Đừng nói về tính năng (Feature), hãy nói về lợi ích (Benefit).\nMarketing nâng cao: Đừng nói về lợi ích, hãy nói về cảm xúc (Emotion) và sự chuyển hóa (Transformation).\n\nVí dụ khi làm Affiliate cho khóa học đầu tư:\n- Cơ bản: \"Khóa học này có 10 module, học online.\"\n- Nâng cao: \"Học xong bạn sẽ biết cách quản lý tài chính.\"\n- Đỉnh cao: \"Hãy tưởng tượng cảm giác mỗi sáng thức dậy, không cần lo lắng về hóa đơn, ung dung uống cà phê và nhìn tài sản tăng trưởng. Đó là sự tự do mà khóa học này mang lại.\"\n\nCon người mua hàng bằng cảm xúc và biện minh bằng logic. Hãy vẽ cho họ thấy bức tranh tương lai tươi đẹp mà họ khao khát. Bạn đang bán giấc mơ, không phải bán hàng hóa.',
      hashtags: ['#Gemral', '#Copywriting', '#VietContent', '#CamXuc', '#NgheThuatBanHang'],
    },
    {
      content: '🦁 \"SĂN BẮN\" VS \"NUÔI DƯỠNG\": CHIẾN LƯỢC NÀO CHO ĐƯỜNG DÀI?\n\n- Săn bắn: Chạy quảng cáo, spam tin nhắn, chốt đơn nhanh, khách đi rồi quên luôn. Tốn sức, tốn tiền, rủi ro cao.\n- Nuôi dưỡng: Xây dựng cộng đồng, chia sẻ kiến thức, làm bạn với khách hàng. Lâu công lúc đầu, nhưng bền vững mãi mãi.\n\nTại Gemral, chúng tôi theo đuổi triết lý \"Farming\" (Canh tác/Nuôi dưỡng). Hệ thống Affiliate của chúng ta được thiết kế để bạn chăm sóc khách hàng trọn đời (Lifetime Commission).\n\nHãy coi danh sách khách hàng của bạn như một khu vườn. Hàng ngày tưới nước (hỏi thăm), bón phân (tặng quà/kiến thức), bắt sâu (giải quyết khiếu nại). Đừng chỉ chực chờ hái quả mà quên chăm sóc cây.\n\nBạn là thợ săn hay người làm vườn?',
      hashtags: ['#Gemral', '#Farming', '#ChamSocKhachHang', '#TuDuyDaiHan', '#KinhDoanhBenVung'],
    },
    {
      content: '🚧 RÀO CẢN KỸ THUẬT: \"EM MÙ CÔNG NGHỆ LẮM!\"\n\nNhiều bạn muốn làm online nhưng sợ: không biết lập Fanpage, không biết edit video, không biết chạy ads.\n\nTin vui: Bạn không cần phải là chuyên gia IT để kiếm tiền online.\n\nTrong hệ sinh thái Gemral, chúng mình đã đơn giản hóa mọi thứ:\n- Có sẵn bài đăng mẫu.\n- Có sẵn landing page.\n- Hệ thống ghi nhận hoa hồng tự động.\n\nViệc duy nhất bạn cần giỏi là: **Kết nối giữa người với người**. Công nghệ là công cụ, con người mới là trung tâm. Đừng để nỗi sợ công nghệ cản bước bạn. Một chiếc smartphone và một trái tim chân thành là đủ để bắt đầu.',
      hashtags: ['#Gemral', '#CongNghe', '#DonGianHoa', '#BatDauTuDau', '#NoiSo'],
    },
    {
      content: '💡 IDEA CONTENT: KHI BÍ Ý TƯỞNG THÌ ĐĂNG GÌ?\n\nĐừng để Fanpage/Profile \"đóng rêu\" vì bí content. Lưu ngay 3 dạng bài luôn có tương tác này:\n\n1. **Quan điểm trái chiều (Controversial):** Nêu quan điểm cá nhân về một vấn đề hot (nhưng đừng tiêu cực). VD: \"Tại sao mình không tin vào việc tiết kiệm tiền lẻ?\"\n2. **Behind the scene (Hậu trường):** Chụp ảnh góc làm việc, cảnh đóng hàng, cảnh đang học Zoom. Cho thấy bạn là người thật, việc thật.\n3. **Câu hỏi mở:** \"Cuối tuần mọi người thường làm gì để xả stress?\", \"Cuốn sách hay nhất bạn từng đọc là gì?\".\n\nMục tiêu là giữ kết nối (Keep in touch). Đừng chỉ hiện lên khi muốn bán hàng. Hãy hiện lên như một người bạn thú vị.',
      hashtags: ['#Gemral', '#BiYTuong', '#ContentIdeas', '#SangTaoNoiDung', '#TuongTac'],
    },
    {
      content: '📉 DOANH SỐ TỤT GIẢM: LÚC NÀY MỚI CẦN BẢN LĨNH\n\nTháng này doanh số thấp? Đừng hoảng. Kinh doanh là hình sin, có lên có xuống.\n\nThay vì than vãn, hãy Audit (kiểm tra) lại quy trình:\n- Lượng tiếp cận (Traffic) có giảm không?\n- Tỷ lệ chốt sale (Conversion) có vấn đề gì không?\n- Đã bao lâu rồi chưa nhắn tin lại cho khách cũ?\n\nDoanh số thấp là lời nhắc nhở của vũ trụ rằng bạn cần nâng cấp kỹ năng hoặc thay đổi chiến thuật. Hãy coi đó là bài kiểm tra, không phải là án tử.\n\nNgồi dậy, chỉnh lại vương miện và tiếp tục chiến đấu nào! 👑',
      hashtags: ['#Gemral', '#QuanTriCamXuc', '#GiaiQuyetVanDe', '#KinhDoanhThucChien', '#NeverGiveUp'],
    },
    {
      content: '✨ LUẬT HẤP DẪN TRONG TUYỂN DỤNG ĐỘI NHÓM\n\nBạn muốn tuyển những CTV năng nổ, tự giác, doanh số cao? Trước hết, BẠN phải là người như thế.\n\n- Bạn lười biếng -> Bạn hút người lười biếng.\n- Bạn hay kêu ca -> Bạn hút toàn những người tiêu cực.\n- Bạn kỷ luật, máu lửa -> Bạn sẽ hút những chiến binh.\n\n\"Mây tầng nào gặp mây tầng đó\". Đừng đi tìm kiếm người giỏi, hãy trở thành người giỏi để người khác muốn đi theo. Xây dựng nhân hiệu (Personal Brand) chính là phát tín hiệu để vũ trụ gửi đúng người đến đội nhóm của bạn.\n\nBạn đang phát ra tín hiệu gì?',
      hashtags: ['#Gemral', '#LuatHapDan', '#LanhDao', '#XayDungDoiNhom', '#TuyenDung'],
    },
    {
      content: '👂 NGHỆ THUẬT ĐẶT CÂU HỎI > NGHỆ THUẬT THUYẾT TRÌNH\n\nNgười bán hàng giỏi không phải là người nói hay, mà là người hỏi đúng.\n\nThay vì thao thao bất tuyệt về công dụng sản phẩm, hãy hỏi:\n- \"Hiện tại anh chị đang gặp khó khăn lớn nhất là gì?\"\n- \"Anh chị mong muốn đạt được điều gì trong 6 tháng tới?\"\n- \"Điều gì khiến anh chị băn khoăn nhất khi ra quyết định đầu tư?\"\n\nKhi bạn hỏi, khách hàng tự nói ra nhu cầu (nhu cầu ẩn). Khi đó, bạn chỉ cần đưa giải pháp khớp với nhu cầu đó. Đó gọi là \"gãi đúng chỗ ngứa\".\n\nTập đặt câu hỏi đi, bạn sẽ thấy việc chốt đơn nhẹ nhàng hơn nhiều.',
      hashtags: ['#Gemral', '#KyNangDatCauHoi', '#CoachingSale', '#ThauHieu', '#GiaoTiep'],
    },
    {
      content: '🎁 FREEBIE (QUÀ MIỄN PHÍ): CHIẾN LƯỢC MỒI CÂU\n\nMuốn có data khách hàng tiềm năng (Lead) mà không tốn tiền quảng cáo? Hãy tặng quà.\n\nQuà ở đây là giá trị tri thức:\n- Ebook \"Cẩm nang chọn đá phong thủy hợp mệnh\".\n- Video \"Hướng dẫn thiền 5 phút mỗi sáng\".\n- Checklist \"10 sai lầm khi đầu tư tài chính\".\n\nTại Gemral, chúng tôi đã soạn sẵn bộ tài liệu này (Lead Magnet). Bạn chỉ cần đăng lên: \"Ai muốn nhận tài liệu này, comment tôi gửi nhé\".\n\nNhững người comment chính là khách hàng tiềm năng. Bạn đã giúp họ (tặng quà), giờ thì việc bắt chuyện tư vấn sẽ dễ dàng hơn gấp bội.\n\nCho đi trước, nhận lại sau. Đó là luật.',
      hashtags: ['#Gemral', '#LeadMagnet', '#PhieuBanHang', '#Marketing0Dong', '#ChienLuoc'],
    },
    {
      content: '🚀 COPYWRITING 101: CÔNG THỨC VIẾT BÀI A.I.D.A\n\nKhông biết viết gì cho hấp dẫn? Áp dụng ngay công thức kinh điển này:\n\n1. **Attention (Gây chú ý):** Một tiêu đề giật gân, một câu hỏi sốc, một hình ảnh lạ. (VD: \"Sự thật về viên đá đổi vận...\")\n2. **Interest (Thích thú):** Kể một câu chuyện, đưa ra một số liệu thú vị để giữ chân người đọc.\n3. **Desire (Khao khát):** Show kết quả, lợi ích, feedback để kích thích mong muốn sở hữu.\n4. **Action (Hành động):** Kêu gọi rõ ràng. \"Inbox ngay\", \"Comment để nhận ưu đãi\".\n\nĐừng viết theo cảm hứng. Hãy viết có cấu trúc. Bài viết của bạn sẽ sắc bén hơn nhiều.',
      hashtags: ['#Gemral', '#AIDA', '#KyNangViet', '#Copywriting', '#ContentBanHang'],
    },
    {
      content: '🧘‍♀️ KINH DOANH TỈNH THỨC (MINDFUL BUSINESS)\n\nChúng ta thường bị cuốn vào vòng xoáy của KPI, deadline, doanh số. Dễ dẫn đến stress và mất kết nối với bản thân.\n\nThử áp dụng sự tỉnh thức vào công việc Affiliate:\n- Trước khi tư vấn: Hít thở sâu, đặt ý niệm \"Tôi muốn giúp đỡ khách hàng này\", không phải \"Tôi muốn lấy tiền của họ\".\n- Khi gặp khách khó tính: Quan sát cảm xúc giận dữ của mình, không phản ứng ngay. Hít thở, rồi trả lời bằng sự điềm tĩnh.\n\nKhi bạn đưa sự tỉnh thức vào công việc, bạn sẽ thấy nhẹ nhàng hơn. Khách hàng cũng cảm nhận được năng lượng bình an từ bạn và tin tưởng bạn hơn.\n\nLàm việc là để hạnh phúc, không phải để khổ đau. ✨',
      hashtags: ['#Gemral', '#KinhDoanhTinhThuc', '#Mindfulness', '#BinhAn', '#PhatTrienTamLinh'],
    },
    {
      content: '💰 TÁI ĐẦU TƯ: BÍ MẬT CỦA SỰ GIÀU CÓ\n\nKiếm được hoa hồng tháng đầu tiên, bạn làm gì? Đi ăn lẩu, mua sắm?\n\nĐừng ăn hết hạt giống. Hãy giữ lại một phần để tái đầu tư:\n- Mua sách/khóa học nâng cao kỹ năng.\n- Nâng cấp gói thành viên (để hưởng hoa hồng cao hơn).\n- Chạy một chút quảng cáo để mở rộng tệp khách.\n- Mua sản phẩm về trải nghiệm/làm quà tặng khách hàng.\n\nNgười nghèo kiếm được tiền là tiêu hết. Người giàu dùng tiền để đẻ ra tiền. Hãy coi công việc Affiliate này là một doanh nghiệp nhỏ của riêng bạn và đầu tư cho nó.',
      hashtags: ['#Gemral', '#QuanLyTaiChinh', '#TaiDauTu', '#TuDuyLAmGiau', '#SmartMoney'],
    },
    {
      content: '🗣 SEEDING (GIEO MẦM): NGHỆ THUẬT ĐIỀU HƯỚNG DƯ LUẬN\n\nBài đăng vắng tanh như chùa bà Đanh? Vì hiệu ứng đám đông: Không ai muốn là người đầu tiên comment.\n\nHãy dùng nghệ thuật Seeding:\n- Nhờ đồng đội trong team vào comment mồi, hỏi han, feedback.\n- Tự comment bổ sung thông tin dưới bài viết.\n- Chia sẻ bài viết vào các nhóm chat Zalo/Tele.\n\nTạo ra không khí sôi động giả lập (ban đầu) để thu hút sự chú ý thật. Nhưng nhớ phải khéo léo, đừng seeding kiểu \"Sản phẩm tốt quá\" copy paste 10 lần nhé, phản cảm lắm!\n\nTại Gemral, chúng mình có nhóm \"Hỗ trợ tương tác\", anh em chéo like cho nhau. Đoàn kết là sức mạnh!',
      hashtags: ['#Gemral', '#Seeding', '#MarketingTips', '#TuongTac', '#MeoVat'],
    },
    {
      content: '🚪 ĐÓNG GÓI SẢN PHẨM (OFFER): LÀM SAO ĐỂ KHÁCH KHÔNG THỂ CHỐI TỪ?\n\nĐừng chỉ bán một món hàng. Hãy bán một \"Lời chào hàng không thể cưỡng lại\" (Irresistible Offer).\n\nVí dụ: Thay vì bán 1 chiếc vòng tay giá 500k.\nHãy bán: Combo \"Bình An Tài Lộc\" giá 599k gồm:\n1. Vòng tay thạch anh (Trị giá 500k).\n2. Ebook hướng dẫn thanh tẩy đá (Trị giá 200k).\n3. Vé tham gia workshop online về phong thủy (Trị giá 500k).\n4. Voucher giảm 10% lần sau.\n\nGiá trị nhận được > Giá tiền bỏ ra. Khách hàng sẽ cảm thấy mình được \"hời\". Hãy tận dụng các tài nguyên số (Ebook, Video, Workshop) của hệ sinh thái Gemral để gia tăng giá trị cho đơn hàng của bạn.',
      hashtags: ['#Gemral', '#ChienLuocGia', '#Offer', '#TangGiaTri', '#BanHangThongMinh'],
    },
    {
      content: '📞 FOLLOW-UP (THEO SÁT): TIỀN NẰM Ở LẦN LIÊN HỆ THỨ 5\n\nThống kê cho thấy: 80% giao dịch thành công sau lần liên hệ thứ 5 đến thứ 12. Nhưng 90% sale bỏ cuộc sau lần 1.\n\nKhách im lặng không có nghĩa là họ không mua. Có thể họ quên, họ chưa có lương, hoặc họ cần thêm thông tin.\n\nHãy kiên trì theo sát (nhưng đừng spam). \n- \"Chị ơi, hôm nay bên em có chương trình ưu đãi mới...\"\n- \"Anh ơi, em vừa đọc được tin này hay về thị trường, gửi anh tham khảo...\"\n\nSự kiên trì lịch sự sẽ đánh gục mọi sự kháng cự. Đừng bỏ quên những khách hàng tiềm năng trong danh sách chờ của bạn.',
      hashtags: ['#Gemral', '#FollowUp', '#KienTri', '#ChamSocKhachHang', '#GiaTangDoanhSo'],
    },
    {
      content: '🌟 HÌNH ẢNH CHUYÊN NGHIỆP: ĐẦU TƯ NHỎ, LỢI ÍCH LỚN\n\nLàm online, hình ảnh đại diện (Avatar) và ảnh bìa (Cover) chính là mặt tiền cửa hàng của bạn.\n\nĐừng để ảnh mờ, tối, hoặc ảnh hoạt hình. Hãy chọn một bức ảnh sáng sủa, rõ mặt, cười tươi, ăn mặc lịch sự. Nó cho thấy bạn là người đàng hoàng, đáng tin cậy.\n\nKhi bạn trông chuyên nghiệp, bạn có thể bán sản phẩm giá cao. Khi bạn trông lôi thôi, bạn chỉ bán được hàng giá rẻ.\n\nCuối tuần này, hãy nhờ bạn bè chụp cho một bức ảnh \"doanh nhân\" một chút nhé. Thay áo mới cho Facebook, đón vận may mới!',
      hashtags: ['#Gemral', '#HinhAnhCaNhan', '#ChuyenNghiep', '#Branding', '#AnTuongDauTien'],
    },
    {
      content: '🔄 VÒNG LẶP THÀNH CÔNG: LÀM - ĐO LƯỜNG - TỐI ƯU\n\nKhông có công thức nào đúng mãi mãi. Thị trường thay đổi, thuật toán thay đổi.\n\nNgười làm Affiliate giỏi là người biết quan sát số liệu:\n- Bài đăng dạng nào nhiều like nhất? -> Làm nhiều hơn.\n- Khung giờ nào khách hay online? -> Đăng giờ đó.\n- Câu chốt sale nào khách hay gật đầu? -> Dùng lại.\n\nĐừng làm như một cái máy. Hãy làm như một nhà khoa học: Thử nghiệm, quan sát và tinh chỉnh. Liên tục tối ưu hóa (Optimize) là chìa khóa để đi từ nghiệp dư lên chuyên nghiệp.',
      hashtags: ['#Gemral', '#ToiUuHoa', '#TuDuyKinhDoanh', '#PhanTich', '#GrowthMindset'],
    },
    {
      content: '❤️ SỨ MỆNH NGƯỜI KẾT NỐI\n\nCuối cùng, hãy nhớ vai trò của bạn không phải là \"con buôn\". Bạn là người kết nối (Connector).\n\nBạn kết nối người đang gặp vấn đề tài chính với giải pháp đầu tư.\nBạn kết nối người đang bất ổn tâm lý với công cụ chữa lành.\n\nKhi bạn đặt cái TÂM của người giúp đỡ vào công việc, bạn sẽ không còn thấy ngại ngùng khi chia sẻ. Bạn sẽ thấy tự hào. Vì mỗi đơn hàng thành công là một người được giúp đỡ.\n\nHãy làm việc với niềm tự hào đó. Vũ trụ sẽ thưởng cho bạn xứng đáng.\n\nCảm ơn các bạn đã chọn đồng hành cùng Gemral. Chúng ta đang cùng nhau kiến tạo một cộng đồng thịnh vượng. 💎',
      hashtags: ['#Gemral', '#SuMenh', '#YNghiaCongViec', '#TuHao', '#CongDong'],
    },
    {
      content: '🎬 VIDEO NGẮN (REELS/TIKTOK): MỎ VÀNG TRAFFIC CHƯA KHAI THÁC HẾT\n\nBạn có biết? Facebook và TikTok đang ưu tiên hiển thị video ngắn gấp 5-10 lần bài viết thường.\n\nĐừng ngại quay video. Không cần nhảy nhót đâu. Bạn chỉ cần:\n- Quay cận cảnh viên đá lấp lánh dưới nắng (nhạc chill).\n- Quay màn hình biểu đồ tăng trưởng (nhạc trend).\n- Quay bạn đang đóng gói hàng gửi khách (âm thanh ASMR).\n\nNhững video 15-30 giây này có sức hút ghê gớm. Nó chân thực và sinh động. Hãy bắt đầu kênh TikTok/Reels của riêng bạn ngay hôm nay. Gemral có kho video stock (video quay sẵn) cho các bạn ghép nhạc đấy, inbox Admin lấy nhé!',
      hashtags: ['#Gemral', '#VideoMarketing', '#Reels', '#TikTok', '#XuHuong'],
    },
    {
      content: '🏗️ XÂY DỰNG PHỄU (FUNNEL) ĐƠN GIẢN TRÊN FACEBOOK CÁ NHÂN\n\nBạn không cần website xịn sò để có phễu bán hàng. Facebook cá nhân chính là cái phễu tốt nhất nếu biết cách sắp xếp.\n\nCông thức phễu tối giản:\n1. **Miệng phễu (Thu hút):** Ảnh bìa & Avatar chuyên nghiệp + Bio rõ ràng (VD: \"Giúp bạn Bình an & Thịnh vượng cùng Gemral\"). Đăng bài chia sẻ giá trị, lifestyle để hút người xem.\n2. **Thân phễu (Nuôi dưỡng):** Các bài viết kể chuyện, chia sẻ kiến thức sâu về đá năng lượng, về tư duy đầu tư. Livestream chia sẻ.\n3. **Đáy phễu (Chuyển đổi):** Bài đăng Feedback khách hàng, Kết quả đầu tư, Ưu đãi giới hạn. Kêu gọi inbox.\n\nKhách hàng sẽ đi từ: Tò mò -> Thích thú -> Tin tưởng -> Mua hàng. Đừng đảo lộn quy trình. Đừng bắt họ mua ngay khi họ chưa biết bạn là ai.\n\nHãy thử kiểm tra lại tường nhà mình xem đã đúng cấu trúc này chưa nhé?',
      hashtags: ['#Gemral', '#SalesFunnel', '#MarketingFacebook', '#ChuyenDoi', '#KinhDoanhOnline'],
    },
    {
      content: '🦅 HIỆU ỨNG \"CHIM MỒI\": CÁCH ĐỂ BÁN GÓI ĐẦU TƯ GIÁ TRỊ CAO\n\nTại sao rạp phim luôn có bắp rang bơ cỡ Vừa và cỡ Lớn với giá chênh nhau rất ít? Để bạn cảm thấy cỡ Lớn là \"hời\" nhất.\n\nTrong tư vấn đầu tư tại Gemral cũng vậy. Khi khách băn khoăn, hãy đưa ra 3 lựa chọn:\n- Gói A (Nhỏ): Lợi nhuận thấp, ít quyền lợi (Mồi).\n- Gói B (Vừa - Mục tiêu): Lợi nhuận tốt, quyền lợi đủ đầy, vốn vừa phải.\n- Gói C (VIP): Quyền lợi siêu cao nhưng vốn lớn.\n\nThường khách sẽ chọn Gói B vì nó an toàn và hợp lý nhất. Gói A tồn tại chỉ để làm nền cho Gói B tỏa sáng. Đừng chỉ đưa 1 lựa chọn, hãy đưa quyền lựa chọn vào tay khách hàng, nhưng bạn là người thiết kế bàn cờ.\n\nĐã ai áp dụng chiêu này và thành công chưa?',
      hashtags: ['#Gemral', '#TamLyHocHanhVi', '#ChienLuocGia', '#ChotSale', '#DecoyEffect'],
    },
    {
      content: '💎 ĐÁ THẠCH ANH VÀ TƯ DUY THỊNH VƯỢNG\n\nNhiều bạn hỏi mình: \"Bán đá thì liên quan gì đến đầu tư tài chính?\"\n\nLiên quan mật thiết! Đá thạch anh (nhất là dòng Citrine/Thạch anh vàng) giúp đả thông bế tắc năng lượng, kích hoạt luân xa 3 (ý chí) và thu hút tài lộc. Khi tâm trí thông thoáng, năng lượng sạch sẽ, người ta mới sáng suốt để ra quyết định đầu tư.\n\nTại Gemral, chúng tôi không chỉ bán sản phẩm. Chúng tôi bán một giải pháp trọn gói: **Dùng đá để trị Tâm, dùng đầu tư để trị Thân (tài chính)**. Đây là combo \"Tâm Thức & Thịnh Vượng\" độc quyền.\n\nHãy tư vấn cho khách hàng cả hai. Một người giàu có bền vững cần cả sự bình an bên trong lẫn sự tự do bên ngoài.',
      hashtags: ['#Gemral', '#TamThucThinhVuong', '#CrossSell', '#TuDuyDauTu', '#NangLuongDa'],
    },
    {
      content: '🚫 3 TỪ \"CẤM KỴ\" KHI TƯ VẤN KHÁCH HÀNG CAO CẤP\n\nLàm việc với người có tiền (High-net-worth individuals), ngôn từ của bạn thể hiện đẳng cấp của bạn.\n\nTránh dùng:\n1. **\"Rẻ\":** Người giàu không thích đồ rẻ, họ thích đồ \"tốt\", đồ \"xứng đáng\". Hãy dùng từ \"Ưu đãi\", \"Giá trị\", \"Tối ưu chi phí\".\n2. **\"Em nghĩ là...\":** Thể hiện sự thiếu chắc chắn. Hãy dùng \"Dựa trên số liệu...\", \"Kinh nghiệm của em cho thấy...\", \"Theo chính sách công ty...\".\n3. **\"Xin lỗi\":** Đừng xin lỗi vì làm phiền. Bạn đang mang đến cơ hội cơ mà? Hãy nói \"Cảm ơn anh/chị đã dành thời gian\".\n\nNâng cấp ngôn từ là nâng cấp thu nhập. Lưu lại để rèn luyện mỗi ngày nhé!',
      hashtags: ['#Gemral', '#GiaoTiepTinhTe', '#HighTicketSales', '#KyNangMem', '#ChuyenNghiep'],
    },
    {
      content: '♻️ SỨC MẠNH CỦA SỰ TÁI TỤC (RETENTION)\n\nSăn khách mới khó gấp 7 lần giữ khách cũ. Nhưng nhiều Affiliate lại bỏ quên mỏ vàng này.\n\nVới các sản phẩm của Yinyang Masters (đá, trầm, nến), khách dùng hết sẽ cần mua lại. Với các gói đầu tư của Gem Capital, hết kỳ hạn khách sẽ tái tục.\n\nBí quyết để họ quay lại:\n- Lưu ngày họ mua hàng. Ước lượng thời gian dùng hết để nhắn tin nhắc nhẹ.\n- Gửi báo cáo lợi nhuận đúng hạn, minh bạch.\n- Tạo cảm giác \"thuộc về\" (Belonging): Mời họ vào nhóm kín, tham gia sự kiện tri ân.\n\nĐừng để khách hàng trở thành \"người lạ từng quen\". Hãy biến họ thành \"người nhà\".',
      hashtags: ['#Gemral', '#RetentionRate', '#KhachHangTrungThanh', '#ChamSocSauBan', '#BiQuyet'],
    },
    {
      content: '🧘‍♂️ QUẢN TRỊ CẢM XÚC: GIỮ CÁI ĐẦU LẠNH VÀ TRÁI TIM NÓNG\n\nThị trường tài chính có lúc xanh lúc đỏ. Khách hàng có lúc vui lúc buồn. Nếu bạn để cảm xúc của mình trồi sụt theo ngoại cảnh, bạn sẽ sớm \"đốt\" năng lượng.\n\nNgười làm kinh doanh bản lĩnh là người:\n- Bình thản trước lời từ chối.\n- Khiêm tốn trước thắng lợi.\n- Điềm tĩnh xử lý khủng hoảng.\n\nThiền định mỗi ngày là cách tốt nhất để tôi luyện \"cơ bắp\" cảm xúc này. Khi tâm bạn tĩnh như mặt hồ, bạn sẽ phản chiếu mọi thứ rõ ràng nhất và đưa ra quyết định chính xác nhất.\n\nSáng nay bạn đã dành 10 phút tĩnh tâm chưa?',
      hashtags: ['#Gemral', '#QuanTriCamXuc', '#EQ', '#BinhTinhSong', '#LanhDaoBanThan'],
    },
    {
      content: '📊 MINH BẠCH CẤP TIẾN (RADICAL TRANSPARENCY) - VŨ KHÍ CẠNH TRANH CỦA GEMRAL\n\nTại sao khách hàng chọn đầu tư qua Gemral chứ không phải chỗ khác?\n\nVì chúng ta dám làm điều ít ai làm: **Minh bạch mọi thứ.**\n- Minh bạch về cơ chế phí.\n- Minh bạch về rủi ro (có gan ăn, có gan chịu, không hứa hão).\n- Minh bạch về danh mục đầu tư.\n\nKhi tư vấn, đừng giấu giếm rủi ro. Hãy nói rõ: \"Đây là cơ hội lợi nhuận cao, nhưng đi kèm rủi ro X, Y. Chúng em quản trị rủi ro bằng cách A, B\".\n\nSự thật thà tạo nên niềm tin sắt đá. Khách hàng thông minh lắm, họ trân trọng người dám nói thật hơn là người chỉ tô hồng.',
      hashtags: ['#Gemral', '#MinhBach', '#UyTin', '#DaoDucKinhDoanh', '#USP'],
    },
    {
      content: '🚀 ĐÒN BẨY (LEVERAGE) TỪ HỆ SINH THÁI\n\nLàm Affiliate cho Gemral sướng ở chỗ: Bạn không chiến đấu một mình. Bạn có cả một hệ sinh thái chống lưng.\n\n- Bạn có **Jennie Uyên Chu** (KOL uy tín) làm đại sứ thương hiệu -> Dễ tạo niềm tin.\n- Bạn có **Bao Long Gallery** (Không gian sang trọng) để mời khách đến trải nghiệm -> Dễ chốt sale.\n- Bạn có **Yinyang Masters** (Sản phẩm phễu) để tiếp cận khách hàng dễ dàng.\n\nHãy biết cách \"mượn lực\". Mời khách đến sự kiện, gửi video của Jennie cho khách xem. Đứng trên vai người khổng lồ thì bạn sẽ cao hơn người khác.',
      hashtags: ['#Gemral', '#DonBay', '#HeSinhThai', '#LoiTheCanhTranh', '#SmartBusiness'],
    },
    {
      content: '📝 KỸ NĂNG VIẾT TIÊU ĐỀ (HEADLINE) \"THÔI MIÊN\"\n\nKhách hàng lướt Facebook rất nhanh. Bạn chỉ có 3 giây để giữ chân họ. Tiêu đề quyết định 80% thành bại.\n\nCông thức tiêu đề hiệu quả:\n1. **Con số + Lợi ích:** \"3 Cách đơn giản để thu hút tài lộc vào nhà\".\n2. **Cảnh báo/Sai lầm:** \"Dừng ngay việc đặt đá phong thủy sai cách nếu không muốn rước họa\".\n3. **Câu hỏi gây tò mò:** \"Tại sao người giàu lại thích sưu tầm Thạch anh vàng?\"\n4. **How-to (Làm thế nào):** \"Làm thế nào để tạo dòng tiền thụ động 10%/năm an toàn?\".\n\nĐừng đặt tiêu đề kiểu: \"Chào ngày mới\", \"Sản phẩm mới về\". Nhạt lắm! Hãy thêm chút \"muối\" vào tiêu đề nhé.',
      hashtags: ['#Gemral', '#HeadlineHacks', '#Copywriting', '#VietContent', '#ThuHut'],
    },
    {
      content: '🌱 NUÔI DƯỠNG \"KHÁCH HÀNG TRỌN ĐỜI\" (LIFETIME CUSTOMER)\n\nMục tiêu của chúng ta không phải là bán một lần rồi thôi. Mục tiêu là đồng hành cùng khách hàng từ khi họ:\n- Bất ổn (Cần chữa lành - Mua đá).\n- Ổn định (Cần phát triển - Học khóa học).\n- Thành công (Cần tích sản - Đầu tư).\n\nHệ sinh thái Gemral được thiết kế để phục vụ trọn vẹn vòng đời này. Nếu bạn chăm sóc tốt, một khách hàng mua vòng tay 500k hôm nay có thể là nhà đầu tư 5 tỷ ngày mai.\n\nHãy nhìn xa hơn đơn hàng trước mắt. Hãy nhìn vào mối quan hệ trọn đời.',
      hashtags: ['#Gemral', '#LTV', '#VongDoiKhachHang', '#TamNhin', '#PhatTrienBenVung'],
    },
    {
      content: '📱 LIVESTREAM: SÂN KHẤU CỦA NGƯỜI BÁN HÀNG HIỆN ĐẠI\n\nLivestream là cách nhanh nhất để xây dựng niềm tin (vì thấy người thật, việc thật) và giải đáp thắc mắc tức thì.\n\nĐừng ngại lên sóng. Bắt đầu đơn giản:\n- Livestream đập hộp sản phẩm đá mới về.\n- Livestream chia sẻ quan điểm về một tin tức tài chính.\n- Livestream Q&A giải đáp thắc mắc.\n\nLần đầu sẽ run, lần hai sẽ đỡ, lần ba sẽ nghiện. Tương tác trực tiếp (Real-time engagement) là vua của các loại tương tác. Thử ngay tối nay nhé?',
      hashtags: ['#Gemral', '#Livestream', '#VideoMarketing', '#KyNangNoi', '#TuTin'],
    },
    {
      content: '🤝 XỬ LÝ KHỦNG HOẢNG: KHI KHÁCH HÀNG KHÔNG HÀI LÒNG\n\nSẽ có lúc hàng lỗi, ship chậm, hoặc thị trường biến động làm khách lo lắng. Cách bạn xử lý lúc này sẽ định hình thương hiệu của bạn.\n\nNguyên tắc 3 bước:\n1. **Lắng nghe & Đồng cảm:** \"Em hiểu anh/chị đang rất lo lắng/bực mình. Em xin lỗi vì trải nghiệm này\". Đừng cãi lý.\n2. **Đưa giải pháp:** \"Để khắc phục, em xin phép... (đổi hàng/bù đắp/giải thích chi tiết)\".\n3. **Chăm sóc sau khủng hoảng:** Theo dõi xem họ đã hài lòng chưa.\n\nBiến \"nguy\" thành \"cơ\". Một khách hàng giận dữ được xoa dịu thành công sẽ trở thành khách hàng trung thành nhất của bạn.',
      hashtags: ['#Gemral', '#XuLyKhieuNai', '#DichVuKhachHang', '#ChuyenNghiep', '#TaiNang'],
    },
    {
      content: '💡 TƯ DUY \"WIN-WIN-WIN\"\n\nTrong mọi giao dịch tại Gemral, chúng ta hướng tới 3 bên cùng thắng:\n1. **Khách hàng thắng:** Nhận được sản phẩm/dịch vụ chất lượng, giải quyết được vấn đề.\n2. **Công ty thắng:** Có doanh thu để duy trì và phát triển, tạo thêm giá trị.\n3. **Bạn (Đối tác) thắng:** Có thu nhập xứng đáng và phát triển bản thân.\n\nNếu một trong ba bên bị thiệt, mô hình đó sẽ sụp đổ. Đừng bao giờ vì hoa hồng của bản thân mà bán sai sản phẩm cho khách (Khách thua). Đừng bao giờ cắt máu giảm giá phá giá (Bạn và Công ty thua).\n\nKinh doanh bền vững là phải giữ được thế kiềng 3 chân này.',
      hashtags: ['#Gemral', '#WinWinWin', '#DaoDucKinhDoanh', '#BenVung', '#TuDuyHeThong'],
    },
    {
      content: '🎁 HIỆU ỨNG \"QUÀ TẶNG BẤT NGỜ\" (SURPRISE & DELIGHT)\n\nLàm sao để khách hàng \"wow\" và nhớ mãi về bạn?\n\nKhi gửi hàng (đá, vật phẩm), hãy kèm theo một món quà nhỏ không báo trước:\n- Một túi muối hồng tẩy uế.\n- Một tấm thiệp viết tay cảm ơn (cái này cực kỳ quyền lực).\n- Một voucher giảm giá cho người thân của họ.\n\nGiá trị vật chất không cần lớn, nhưng giá trị tinh thần là vô giá. Nó cho thấy sự trân trọng và tỉ mỉ của bạn. Khách hàng sẽ chụp ảnh khoe lên Facebook, và đó là Marketing miễn phí cho bạn đấy!',
      hashtags: ['#Gemral', '#WowService', '#ChamSocKhachHang', '#BiKipBanHang', '#TinhTe'],
    },
    {
      content: '📅 KỶ LUẬT LÀ TỰ DO\n\nNhiều người nghĩ làm tự do (Freelance/Affiliate) là thích làm lúc nào thì làm. Sai lầm! Đó là công thức của sự thất bại.\n\nLàm tự do nghĩa là bạn phải tự làm chủ (Self-discipline). Không có sếp nhắc nhở, bạn phải tự nhắc mình.\n\n- Lên lịch làm việc tuần.\n- Đặt KPI cho bản thân (VD: Mỗi ngày kết nối 5 người mới).\n- Cam kết hoàn thành task trong ngày.\n\nKhi bạn kỷ luật, dòng tiền sẽ đều đặn. Khi đó, bạn mới có sự tự do thực sự (tự do tài chính, tự do thời gian). Kỷ luật không phải là gông cùm, nó là chìa khóa mở cánh cửa tự do.',
      hashtags: ['#Gemral', '#KyLuat', '#SelfDiscipline', '#TuDoTaiChinh', '#Mindset'],
    },
    {
      content: '🧠 HỌC CÁCH \"ĐỨNG TRÊN VAI NGƯỜI KHỔNG LỒ\"\n\nTrong cộng đồng Gemral, có những \"cá mập\", những chuyên gia hàng đầu. Làm sao để tận dụng?\n\n- Chia sẻ bài viết của họ kèm quan điểm của bạn (nhớ ghi nguồn).\n- Mời họ livestream chung (nếu bạn đủ thân hoặc có cộng đồng tốt).\n- Sử dụng uy tín của họ (Endorsement) để củng cố niềm tin cho khách hàng: \"Dự án này được cố vấn bởi chị Jennie Uyên Chu...\".\n\nĐừng cố gắng tự mình chứng minh tất cả. Hãy dùng những bằng chứng xã hội (Social Proof) đã có sẵn. Thông minh hơn, đỡ vất vả hơn.',
      hashtags: ['#Gemral', '#SocialProof', '#DonBayUyTin', '#KOLMarketing', '#ChienLuoc'],
    },
    {
      content: '🌟 PHÁT TRIỂN BẢN THÂN (SELF-GROWTH) SONG HÀNH PHÁT TRIỂN KINH DOANH\n\nThu nhập của bạn hiếm khi vượt quá mức độ phát triển bản thân của bạn.\n\nNếu bạn muốn kiếm 100 triệu, bạn phải có tư duy, kỹ năng, và năng lượng của người kiếm 100 triệu. Nếu trúng số mà không có năng lực giữ tiền, tiền cũng bay đi.\n\nTại Gemral, chúng tôi coi trọng việc đào tạo con người hơn là dạy chiêu trò. Chúng tôi dạy thiền, dạy quản lý tài chính, dạy lãnh đạo.\n\nHãy cam kết: Mỗi ngày học một điều mới. Mỗi tháng tốt hơn mình của tháng trước 1%. Đó là lãi kép của cuộc đời.',
      hashtags: ['#Gemral', '#PhatTrienBanThan', '#HocTapTronDoi', '#NangTamGiaTri', '#Growth'],
    },
    {
      content: '💬 LỜI KHẲNG ĐỊNH (AFFIRMATIONS) CHO NGƯỜI BÁN HÀNG\n\nTrước khi bắt đầu ngày mới, hãy tự nói với mình:\n- \"Tôi là người mang lại giá trị.\"\n- \"Tôi xứng đáng với sự thịnh vượng.\"\n- \"Tôi thu hút những khách hàng tuyệt vời.\"\n- \"Tôi bán hàng bằng cả trái tim.\"\n\nLời khẳng định tích cực giúp cài đặt lại tiềm thức (Reprogramming Subconscious), xóa bỏ nỗi sợ hãi và sự tự ti. Năng lượng của bạn sẽ thay đổi, và kết quả sẽ thay đổi.\n\nThử comment một câu khẳng định của bạn xuống dưới xem nào! 👇',
      hashtags: ['#Gemral', '#Affirmations', '#LuatHapDan', '#TuDuyTichCuc', '#NangLuongNgayMoi'],
    },
    {
      content: '🛑 ĐỪNG CHỈ BÁN SẢN PHẨM, HÃY BÁN GIẢI PHÁP CHO \"NỖI ĐAU\"\n\nKhách hàng không mua \"khóa học tài chính\". Họ mua \"cách thoát khỏi nợ nần\" hoặc \"cách để tiền đẻ ra tiền\".\nKhách hàng không mua \"vòng tay đá\". Họ mua \"sự an tâm\", \"giấc ngủ ngon\", \"may mắn trong tình duyên\".\n\nHãy tìm ra \"nỗi đau\" (Pain point) của họ và đưa sản phẩm của bạn vào như một liều thuốc giảm đau.\n\n- \"Chị đang lo lắng về lạm phát ăn mòn tiền tiết kiệm? Gói đầu tư này giúp chị bảo vệ tài sản...\"\n- \"Em thấy dạo này chị hay than mệt mỏi? Viên đá này giúp cân bằng năng lượng...\"\n\nThấu hiểu nỗi đau là bước đầu tiên của mọi thương vụ thành công.',
      hashtags: ['#Gemral', '#PainPoint', '#GiaiPhap', '#BanHangThauHieu', '#TamLyHoc'],
    },
    {
      content: '🌈 CỘNG ĐỒNG GEMRAL - NƠI KHÔNG AI BỊ BỎ LẠI PHÍA SAU\n\nLàm kinh doanh, sợ nhất là cô đơn. Nhưng ở đây, chúng ta là một gia đình.\n\nCó khó khăn? Hỏi trên nhóm, 500 anh em sẽ vào hỗ trợ.\nCó niềm vui? Khoe lên, cả ngàn người chúc mừng.\nCó kiến thức hay? Chia sẻ để cùng nhau tiến bộ.\n\nVăn hóa \"Cho đi là còn mãi\" là sợi chỉ đỏ xuyên suốt cộng đồng này. Chúng ta không cạnh tranh nhau, chúng ta cùng nhau làm to cái bánh thị trường.\n\nCảm ơn vì bạn đã là một phần của Gemral. Hãy cùng nhau đi thật xa nhé! ❤️💎',
      hashtags: ['#Gemral', '#CongDongThinhVuong', '#VanHoaDoanhNghiep', '#DoanKet', '#YeuThuong'],
    },
    {
      content: '🌊 DÒNG TIỀN THỊNH VƯỢNG (PROSPERITY CASH FLOW) LÀ GÌ?\n\nTrong đầu tư và kinh doanh tại Gemral, chúng mình không dùng từ \"lãi suất\" một cách khô khan. Chúng mình gọi đó là \"Dòng tiền thịnh vượng\".\n\nKhác biệt nằm ở đâu?\n- \"Lãi suất\" chỉ là con số vô hồn.\n- \"Dòng tiền thịnh vượng\" là năng lượng. Nó là kết quả của việc bạn trao đi giá trị thực, giúp đỡ người khác (mua đá để an tâm, đầu tư để an toàn) và nhận lại phần thưởng xứng đáng.\n\nKhi bạn làm Affiliate với tâm thế kiến tạo sự thịnh vượng cho người khác, dòng tiền chảy về túi bạn sẽ là dòng tiền sạch, bền vững và mang lại hạnh phúc. Đó là lý do tại sao các Partner của Gemral luôn ngủ ngon mỗi tối.\n\nBạn muốn kiếm tiền hay muốn kiến tạo dòng tiền thịnh vượng? Comment \"Thịnh Vượng\" để khẳng định nhé! ✨',
      hashtags: ['#Gemral', '#DongTienThinhVuong', '#TuDuyTaiChinh', '#NangLuongTien', '#HanhPhuc'],
    },
    {
      content: '🌪 QUẢN TRỊ RỦI RO: BÀI HỌC SỐ 1 CỦA DÂN CHUYÊN NGHIỆP\n\nNhiều bạn mới làm Affiliate thường mắc lỗi: Chỉ tô hồng sản phẩm mà giấu nhẹm rủi ro. Khách hàng không ngốc, họ biết \"lợi nhuận cao đi kèm rủi ro cao\".\n\nHãy áp dụng nguyên tắc \"Minh bạch cấp tiến\" (Radical Transparency) của Gem Capital Holding. Hãy nói rõ:\n- Đá tự nhiên sẽ có vân mây, vết rạn (đó là vẻ đẹp, không phải lỗi).\n- Đầu tư tài chính có chu kỳ lên xuống, không phải lúc nào cũng xanh.\n\nKhi bạn dám nói thật về những điểm chưa hoàn hảo, khách hàng sẽ tin bạn tuyệt đối 100% về những điểm tốt. Sự chân thật là vũ khí marketing mạnh nhất thời đại này.',
      hashtags: ['#Gemral', '#MinhBach', '#QuanTriRuiRo', '#UyTin', '#KinhDoanhTuTe'],
    },
    {
      content: '🚀 SCALING UP: LÀM SAO ĐỂ X2, X3 THU NHẬP MÀ KHÔNG X2 THỜI GIAN?\n\nBạn đang kiếm được 10 triệu/tháng nhưng cảm thấy kiệt sức vì làm 12 tiếng/ngày? Đó là lúc bạn cần \"Scale up\" (Mở rộng quy mô).\n\n1. **Outsource (Thuê ngoài):** Những việc lặp lại (đóng hàng, rep inbox cơ bản), hãy thuê sinh viên làm part-time. Dành thời gian của bạn cho việc chốt sale và chiến lược.\n2. **Công nghệ:** Dùng Chatbot để trả lời tự động. Dùng phần mềm quản lý CRM để chăm sóc khách hàng.\n3. **Nhân bản (Clone):** Đào tạo ra 3-5 người giống bạn (F1). Thu nhập từ hệ thống sẽ giúp bạn giải phóng sức lao động.\n\nĐừng làm nô lệ cho công việc kinh doanh của mình. Hãy làm chủ nó. Bạn đang ở giai đoạn \"tự làm\" hay \"thuê làm\"?',
      hashtags: ['#Gemral', '#MoRongQuyMo', '#TuDoThoiGian', '#HieuSuat', '#LanhDao'],
    },
    {
      content: '💎 ĐỊNH GIÁ BẢN THÂN: BẠN ĐÁNG GIÁ BAO NHIÊU?\n\nTại sao cùng bán một viên đá thạch anh, có người bán 200k không ai mua, có người bán 2 triệu khách tranh nhau chốt?\n\nKhác biệt nằm ở \"Giá trị gia tăng\" (Value Added) mà bạn nạp vào sản phẩm:\n- Kiến thức chuyên sâu của bạn.\n- Sự tư vấn tận tâm.\n- Bao bì đóng gói sang trọng.\n- Năng lượng bình an bạn truyền tải.\n\nĐừng bán hàng giá rẻ. Hãy bán hàng giá trị cao. Nâng tầm bản thân lên, bạn sẽ thu hút những khách hàng đẳng cấp tương xứng. Đừng tự dìm giá trị của mình xuống chỉ để cạnh tranh về giá.',
      hashtags: ['#Gemral', '#DinhGia', '#GiaTriBanThan', '#HighTicket', '#TuDuyKinhDoanh'],
    },
    {
      content: '🧘 KHI NÀO NÊN DỪNG LẠI? (NGHỆ THUẬT NGHỈ NGƠI)\n\nKinh doanh online là một cuộc marathon, không phải cuộc thi chạy nước rút. Sẽ có lúc bạn thấy chán, thấy mệt, thấy bế tắc.\n\nĐó là tín hiệu vũ trụ bảo bạn: \"Hãy nghỉ ngơi\".\n\n- Tắt điện thoại 1 ngày cuối tuần.\n- Đi spa, đi dạo, cầm viên đá ra công viên ngồi thiền.\n- Đọc một cuốn sách không liên quan đến kinh doanh.\n\nKhi bạn sạc đầy pin năng lượng, bạn sẽ quay lại lợi hại hơn xưa gấp bội. Đừng cố đấm ăn xôi khi năng lượng đang cạn kiệt. Khách hàng cảm nhận được đấy!\n\nCuối tuần này bạn có kế hoạch \"sạc pin\" gì chưa?',
      hashtags: ['#Gemral', '#NghiNgoi', '#TaiTaoNangLuong', '#SucKhoe', '#WorkLifeBalance'],
    },
    {
      content: '🧠 HỘI CHỨNG KẺ MẠO DANH (IMPOSTER SYNDROME)\n\n\"Mình có đủ giỏi để tư vấn cho người khác không?\", \"Mình chưa giàu lắm sao dám dạy người ta đầu tư?\".\n\nNhiều bạn CTV giỏi nhưng bị hội chứng này kìm hãm. Sự thật là: Bạn không cần phải là chuyên gia số 1 thế giới để giúp người khác. Bạn chỉ cần là người đi trước họ 1 bước.\n\n- Bạn đã đầu tư và có lãi chút ít -> Bạn có thể hướng dẫn người chưa biết gì.\n- Bạn đã dùng đá và thấy ngủ ngon -> Bạn có thể chia sẻ cho người đang mất ngủ.\n\nHãy chia sẻ những gì bạn đã trải nghiệm thực tế. Sự chân thật (Authenticity) quan trọng hơn sự hoàn hảo. Tự tin lên nào!',
      hashtags: ['#Gemral', '#TuTin', '#ImposterSyndrome', '#PhatTrienBanThan', '#ChiaSe'],
    },
    {
      content: '🌐 XÂY DỰNG ĐẾ CHẾ RIÊNG TRÊN INTERNET\n\nFacebook cá nhân là nhà trọ (Mark Zuckerberg có thể khóa nick bạn bất cứ lúc nào). Hãy xây nhà riêng của bạn.\n\n- Một Blog chia sẻ kiến thức phong thủy/đầu tư.\n- Một kênh YouTube/TikTok thương hiệu cá nhân.\n- Một danh sách Email (Email list) khách hàng thân thiết.\n\nĐây là những tài sản số (Digital Assets) thuộc sở hữu của bạn. Dù thuật toán thay đổi, dù mạng xã hội sập, bạn vẫn nắm trong tay tệp khách hàng của mình. Đó mới là sự an toàn thực sự.\n\nBắt đầu tích lũy tài sản số ngay hôm nay cùng Gemral nhé!',
      hashtags: ['#Gemral', '#TaiSanSo', '#BenVung', '#MarketingDaKenh', '#AnToan'],
    },
    {
      content: '🎯 THIẾT LẬP MỤC TIÊU S.M.A.R.T CHO THÁNG MỚI\n\nĐừng nói: \"Tháng này tôi sẽ cố gắng bán nhiều nhất có thể\". Đó là lời nói suông.\n\nHãy nói: \"Tháng này tôi sẽ đạt doanh số **50 triệu** (Specific - Cụ thể) bằng cách tiếp cận **100 khách hàng** (Measurable - Đo lường được), để đạt hoa hồng **5 triệu** (Achievable - Khả thi), phục vụ mục tiêu **mua laptop mới** (Relevant - Liên quan), trước ngày **30/11** (Time-bound - Có thời hạn)\".\n\nKhi mục tiêu rõ ràng, não bộ sẽ tự động tìm giải pháp. Viết mục tiêu của bạn xuống comment để vũ trụ ghi nhận nào! 👇',
      hashtags: ['#Gemral', '#SMARTGoals', '#MucTieu', '#KyLuat', '#KeHoach'],
    },
    {
      content: '🤝 VĂN HÓA \"CHO ĐI\" CỦA GEMRAL\n\nTại sao cộng đồng chúng ta phát triển mạnh? Vì chúng ta không giấu nghề.\n\nKhi bạn tìm ra một cách chạy quảng cáo hiệu quả, hay một mẫu content viral, hãy chia sẻ lại cho đồng đội. Đừng sợ họ cướp miếng cơm.\n\nThị trường ngoài kia mênh mông, khách hàng nhiều vô kể. Khi bạn giúp người khác thành công, uy tín của bạn tăng lên, bạn trở thành Leader. Và thu nhập của Leader luôn cao hơn thu nhập của Best Seller.\n\nSông càng sâu càng tĩnh lặng, lúa càng chín càng cúi đầu. Người càng giỏi càng khiêm tốn sẻ chia.',
      hashtags: ['#Gemral', '#VanHoaDoanhNghiep', '#ChoDi', '#LanhDao', '#TuDuyLon'],
    },
    {
      content: '🗣 FEEDBACK KHÁCH HÀNG: CÁCH XIN KHÉO LÉO NHẤT\n\nFeedback là vàng, nhưng làm sao để xin mà khách không thấy phiền?\n\nĐừng hỏi: \"Chị dùng thấy tốt không ạ?\"\nHãy hỏi: \"Chị ơi, từ hôm đeo vòng tay đến giờ, chị thấy giấc ngủ có cải thiện chút nào không ạ? Em đang muốn thu thập trải nghiệm thực tế để hoàn thiện sản phẩm hơn\".\n\nHoặc tặng quà: \"Bên em đang có chương trình tặng Ebook phong thủy cho khách hàng gửi feedback. Chị chụp giúp em tấm hình chị đeo vòng xinh đẹp gửi em nhé\".\n\nKhi khách hàng thấy ý kiến của họ được trân trọng, họ sẽ sẵn lòng chia sẻ. Và nhớ xin phép trước khi đăng nhé!',
      hashtags: ['#Gemral', '#Feedback', '#SocialProof', '#ChamSocKhachHang', '#BiKip'],
    },
    {
      content: '📚 ĐẦU TƯ CHO CÁI ĐẦU KHÔNG BAO GIỜ LỖ\n\nWarren Buffett nói: \"Đầu tư càng nhiều vào bản thân càng tốt, bạn là tài sản lớn nhất của chính mình\".\n\nHãy trích 5-10% thu nhập hàng tháng vào quỹ học tập:\n- Mua sách.\n- Mua khóa học kỹ năng (Marketing, Sales, Tâm lý).\n- Mời cafe những người giỏi hơn mình để học hỏi.\n\nKiến thức vào đầu rồi không ai lấy đi được. Thị trường có sập, công ty có phá sản, nhưng kỹ năng và tư duy của bạn vẫn còn đó để gây dựng lại từ đầu. Đó là sự bảo hiểm tốt nhất.',
      hashtags: ['#Gemral', '#PhatTrienBanThan', '#HocTap', '#DauTuThongMinh', '#WarrenBuffett'],
    },
    {
      content: '🎁 QUÀ TẶNG CUỐI TUẦN: BỘ TÀI LIỆU \"XỬ LÝ 101 TÌNH HUỐNG KHÓ ĐỠ KHI BÁN HÀNG\"\n\n- Khách chê đắt.\n- Khách hỏi \"Đá này có phải đá thật không?\".\n- Khách đòi cam kết lợi nhuận 100%.\n- Khách bom hàng.\n\nTất cả kịch bản ứng xử khôn khéo nhất đã được team Gemral tổng hợp trong file PDF này. Ai muốn nhận để nâng trình \"đối ngoại\" thì thả tim và comment \"101\" nhé. Mình gửi ngay!',
      hashtags: ['#Gemral', '#TaiLieu', '#XuLyTuChoi', '#QuaTang', '#KienThucThucChien'],
    },
    {
      content: '🕯 NGHI THỨC TRƯỚC KHI LÀM VIỆC: BÍ MẬT CỦA SỰ TẬP TRUNG\n\nBạn có thói quen gì trước khi bắt đầu ngồi vào bàn làm việc không?\n\nMình thường:\n1. Dọn sạch mặt bàn.\n2. Đốt một nụ trầm (của Yinyang Masters).\n3. Viết ra 3 việc quan trọng nhất phải làm hôm nay.\n\nNghi thức nhỏ này gửi tín hiệu cho não bộ: \"Đến giờ tập trung rồi\". Mùi trầm hương giúp định tâm, xua tan tạp niệm. \n\nHãy tạo cho mình một \"Nghi thức khởi động\" (Start-up Ritual) để kích hoạt trạng thái làm việc đỉnh cao (Flow state) nhé.',
      hashtags: ['#Gemral', '#HieuSuat', '#NghiThuc', '#TapTrung', '#TramHuong'],
    },
    {
      content: '🦅 TƯ DUY ĐẠI BÀNG: KHÔNG ĐỢI MỒI, HÃY ĐI SĂN\n\nNhiều bạn làm CTV nhưng tư duy thụ động: Đăng bài lên xong ngồi đợi khách inbox. Không có ai inbox thì than vãn.\n\nĐại bàng không đợi mồi. Đại bàng bay đi tìm mồi.\n- Chủ động inbox hỏi thăm khách cũ.\n- Chủ động tham gia các group mới để kết bạn.\n- Chủ động livestream, quay video để kéo tương tác.\n\nTiền nằm ở sự chủ động. Cơ hội chỉ đến với người đi tìm nó. Hãy dang đôi cánh đại bàng của bạn ra và làm chủ bầu trời kinh doanh của mình đi nào!',
      hashtags: ['#Gemral', '#ChuDong', '#TuDuyDaiBang', '#HanhDong', '#KinhDoanh'],
    },
    {
      content: '🚪 CÁNH CỬA NÀY ĐÓNG LẠI, CÁNH CỬA KHÁC MỞ RA\n\nCó thể bạn vừa mất một khách hàng lớn. Có thể tài khoản quảng cáo vừa bị khóa. Có thể video tâm huyết bị flop.\n\nĐừng buồn. Trong nguy có cơ. Mất khách hàng này là bài học để bạn chăm sóc khách sau tốt hơn. Ads chết là cơ hội để bạn tập trung vào Traffic tự nhiên (SEO, TikTok).\n\nVũ trụ không bao giờ triệt đường sống của ai. Vũ trụ chỉ đang điều hướng bạn sang con đường tốt hơn thôi. Hãy giữ vững niềm tin và tiếp tục bước đi.\n\n\"Thất bại là mẹ thành công\" - câu này cũ nhưng chưa bao giờ sai.',
      hashtags: ['#Gemral', '#LacQuan', '#BaiHoc', '#VuotQuaKhoKhan', '#DongLuc'],
    },
    {
      content: '🤝 ĐỐI TÁC TRỌN ĐỜI: LỜI HỨA TỪ GEMRAL\n\nChúng tôi không gọi bạn là CTV hay nhân viên bán hàng. Chúng tôi gọi bạn là **Đối tác (Partner)**.\n\nVì chúng ta đi cùng nhau không chỉ một chuyến hàng, mà là cả một sự nghiệp. Khi Gemral lớn mạnh, bạn cũng lớn mạnh. Khi chúng tôi IPO hay mở rộng quốc tế, bạn là những người đầu tiên hưởng lợi.\n\nHãy tin tưởng vào tầm nhìn của Gem Capital Holding. Chúng ta đang xây dựng một đế chế \"Tâm thức & Thịnh vượng\" đầu tiên tại Việt Nam. Tự hào khi được đồng hành cùng các bạn!',
      hashtags: ['#Gemral', '#DoiTacChienLuoc', '#TamNhin', '#GiaDinhGemral', '#TuHao'],
    },
    {
      content: '🌈 TỰ DO TÀI CHÍNH: ĐÍCH ĐẾN CỦA CHÚNG TA\n\nLàm Affiliate, bán đá, trade coin... tất cả chỉ là công cụ. Đích đến cuối cùng là sự **Tự Do**.\n\nTự do để không phải nhìn giá khi đi ăn. Tự do để đưa bố mẹ đi du lịch. Tự do để dành thời gian cho con cái.\n\nHãy luôn ghi nhớ đích đến đó. Mỗi đơn hàng bạn chốt, mỗi đồng hoa hồng bạn kiếm được, là một viên gạch xây nên bức tường tự do của bạn.\n\nĐừng làm vì tiền. Hãy làm vì sự tự do mà tiền mang lại. Chúc cả nhà một ngày làm việc tràn đầy cảm hứng! 🗽',
      hashtags: ['#Gemral', '#TuDoTaiChinh', '#MucDichSong', '#FinancialFreedom', '#Inspiration'],
    },
    {
      content: '🙋‍♀️ Q&A: \"LÀM SAO ĐỂ GIỮ LỬA KHI LÀM VIỆC TẠI NHÀ?\"\n\nLàm việc ở nhà (Work from home) sướng thật đấy, nhưng dễ lười và mất tập trung. Bí kíp của mình:\n\n1. **Thay đồ:** Đừng mặc đồ ngủ làm việc. Hãy mặc đồ lịch sự như đi làm, tâm thế sẽ khác hẳn.\n2. **Tách biệt không gian:** Đừng làm việc trên giường. Hãy có một góc làm việc riêng.\n3. **Kết nối:** Thường xuyên call video với đồng đội trong team Gemral để tám chuyện, trao đổi công việc. Đừng để mình cô đơn.\n\nKỷ luật là tự do. Hãy là người sếp nghiêm khắc nhất của chính mình nhé!',
      hashtags: ['#Gemral', '#WorkFromHome', '#KyLuat', '#HieuSuat', '#MeoLamViec'],
    },
    {
      content: '📢 KÊU GỌI HÀNH ĐỘNG: THAM GIA THỬ THÁCH \"7 NGÀY RA ĐƠN\"\n\nBạn là người mới? Bạn đang mất phương hướng? Hãy tham gia thử thách này cùng Gemral.\n\nTrong 7 ngày, chúng tôi sẽ hướng dẫn bạn từng bước:\n- Ngày 1: Chuẩn hóa Facebook.\n- Ngày 2: Đăng bài Storytelling.\n- Ngày 3: Tương tác hút khách...\n\nCam kết: Làm đúng bài tập, chắc chắn ra đơn. Ai dám chơi lớn comment \"CHIẾN\" để được add vào nhóm kín training nhé!',
      hashtags: ['#Gemral', '#ThuThach', '#Challenge', '#RaDon', '#HanhDongNgay'],
    },
    {
      content: '💸 AFFILIATE VS. ĐỐI TÁC (CTV): SỰ KHÁC BIỆT NẰM Ở TƯ DUY\n\nNhiều bạn hỏi: \"Mình chỉ muốn share link kiếm tiền cafe thôi được không?\". Được chứ! Với mức **Affiliate Flat Rate 3%**, bạn vẫn có thể kiếm thêm chút đỉnh.\n\nNhưng nếu bạn muốn xây dựng sự nghiệp? Hãy nhìn vào bảng cơ chế của **CTV (Partner)**:\n- Hoa hồng sản phẩm số lên tới **30%** (Gấp 10 lần Affiliate thường!).\n- Hoa hồng đá phong thủy lên tới **15%**.\n- Và đặc biệt: **Thưởng nóng (Bonus KPI)** bằng tiền mặt.\n\nTại sao Gemral lại trả cao như vậy? Vì chúng tôi không tìm người \"rải link\". Chúng tôi tìm những người đồng hành, những người dám cam kết học tập và phát triển. \n\nBạn muốn nhặt tiền lẻ hay muốn hứng cơn mưa tài lộc? Lựa chọn nằm ở nút \"Đăng ký Đối tác\".',
      hashtags: ['#Gemral', '#AffiliateVsPartner', '#CoCheHoaHong', '#KiemTienOnline', '#SuNghiep'],
    },
    {
      content: '💎 BÁN \"ĐÁ\" HAY BÁN \"SỰ CHỮA LÀNH\"?\n\nKhi bạn cầm trên tay viên thạch anh của Yinyang Masters, đừng chỉ nghĩ nó là cục đá. Hãy nghĩ về nó như một **Công cụ Thiền** và **Sản phẩm Healing**.\n\nVới mức hoa hồng cho CTV khởi điểm từ **3% lên đến 15%** (cho cấp Grand), việc bán các sản phẩm vật lý (Physical Products) là cách dễ nhất để bắt đầu.\n\nTại sao? Vì nhu cầu là có thật. Ai cũng muốn bình an, ai cũng muốn bàn làm việc đẹp và tụ năng lượng. Đây là sản phẩm \"phễu\" tuyệt vời để bạn kết nối với khách hàng trước khi giới thiệu các gói khóa học cao cấp hơn.\n\nHãy bắt đầu từ những viên đá nhỏ, để xây nên tòa lâu đài lớn.',
      hashtags: ['#Gemral', '#YinyangMasters', '#DaNangLuong', '#BanHangTuTam', '#KhoiDau'],
    },
    {
      content: '📈 PHÂN TÍCH BÀI TOÁN: LÀM SAO ĐỂ ĐẠT THU NHẬP 10 TRIỆU ĐẦU TIÊN?\n\nVới cơ chế **Cấp 1 (Beginner)** của Gemral, bạn nhận 10% hoa hồng sản phẩm số. Hãy làm phép tính:\n\nChỉ cần bán được **5 khóa học Trading** (Tier 1 - 11 triệu):\n- Doanh số: 55 triệu.\n- Hoa hồng (10%): 5.5 triệu.\n- **ĐẶC BIỆT - BONUS KPI:** Đạt 5 học viên Trading -> Thưởng nóng **5 TRIỆU**.\n\n👉 Tổng thu nhập: 5.5 + 5 = **10.5 Triệu VNĐ**.\n\nChỉ cần tìm được 5 người muốn học giao dịch bài bản. Khó không? Không khó nếu bạn biết cách tiếp cận đúng tệp. 10 triệu đầu tiên không đến từ việc làm nhiều, mà đến từ việc hiểu rõ cơ chế thưởng!',
      hashtags: ['#Gemral', '#BaiToanThuNhap', '#KPIBonus', '#MucTieu', '#KeHoachHanhDong'],
    },
    {
      content: '🚀 LỘ TRÌNH THĂNG TIẾN: TỪ \"BEGINNER\" ĐẾN \"GRAND PARTNER\"\n\nỞ công ty truyền thống, bạn mất 5-10 năm để lên sếp. Ở Gemral, bạn có thể thăng cấp trong 3-6 tháng nhờ cơ chế **Tích lũy doanh số**.\n\n- **Beginner:** Bạn bắt đầu hành trình.\n- **Growing (Đạt 100M):** Hoa hồng tăng lên 15%. Bạn bắt đầu có đà.\n- **Master (Đạt 300M):** Hoa hồng 20%. Bạn là cao thủ.\n- **Grand (Đạt 600M):** Hoa hồng **30%** - Đỉnh cao danh vọng.\n\nDoanh số được cộng dồn, không bị reset mỗi tháng. Nghĩa là chỉ cần bạn kiên trì, không bỏ cuộc, chắc chắn bạn sẽ lên đỉnh. Bạn đang ở nấc thang nào rồi?',
      hashtags: ['#Gemral', '#ThangTien', '#TichLuyDoanhSo', '#GrandPartner', '#KienTri'],
    },
    {
      content: '🧠 BÁN KIẾN THỨC - BÁN SỰ THỊNH VƯỢNG\n\nTrong các sản phẩm của Gemral, các khóa học Mindset như **\"Tái tạo tư duy triệu phú\"** (499k) hay **\"Kích hoạt tần số tình yêu\"** (399k) là dễ bán nhất.\n\nGiá mềm (chỉ bằng bữa ăn), nhưng giá trị chuyển đổi tâm thức cực lớn. Đây là sản phẩm \"chim mồi\" hoàn hảo.\n\nChiến thuật cho CTV mới:\n1. Bán khóa học giá rẻ để khách hàng trải nghiệm chất lượng đào tạo.\n2. Khi họ thấy hay, tư vấn tiếp khóa **\"7 Ngày Khai Mở Tần Số Gốc\"** (1.99M).\n3. Khi họ muốn kiếm tiền từ trading, giới thiệu **Bundle Frequency Trading**.\n\nĐó gọi là chiến lược leo thang giá trị (Value Ladder). Đừng bán cái đắt nhất ngay từ đầu, hãy dẫn dắt họ đi từng bước.',
      hashtags: ['#Gemral', '#ChienLuocPheu', '#KhoaHocOnline', '#PhatTrienBanThan', '#Upsell'],
    },
    {
      content: '🔥 \"CƠN MƯA\" TIỀN THƯỞNG: GIẢI MÃ CHÍNH SÁCH BONUS KPI\n\nNhiều nơi chỉ trả hoa hồng %. Gemral chơi lớn: **Trả thêm tiền mặt (Hard Cash) khi đạt mốc.**\n\nNhìn vào bảng Bonus của cấp **Grand Partner** mà xem:\n- Đạt 25 học viên Trading -> Thưởng nóng **20 TRIỆU**.\n- Cộng với 30% hoa hồng của (25 x 11tr) = **82.5 TRIỆU**.\n👉 Tổng cầm về: **Hơn 100 TRIỆU/tháng**.\n\nĐây không phải bánh vẽ. Đây là con số thực tế mà các Top Partner đang nhận. Bạn có muốn tên mình nằm trong danh sách nhận thưởng tháng này không?',
      hashtags: ['#Gemral', '#ThuongNong', '#ThuNhapKhung', '#DongLuc', '#ChinhPhucMucTieu'],
    },
    {
      content: '🤖 BÁN CÔNG CỤ (TOOLS): MỎ VÀNG ÍT NGƯỜI BIẾT\n\nTrong giới Trading, ai cũng cần công cụ. **Gem Trading Scanner & Chatbot** không phải là khóa học lý thuyết, nó là \"cần câu cơm\".\n\nCác gói Bundle 11tr, 21tr, 68tr là sự kết hợp giữa **Kiến thức (Khóa học)** + **Công cụ (Scanner/Bot)**. Đây là combo hủy diệt.\n\nKhi bạn bán một giải pháp giúp khách hàng kiếm được tiền (từ trading), họ sẽ không tiếc tiền đầu tư. Hãy tập trung nhấn mạnh vào tính năng và hiệu quả của bộ công cụ độc quyền này khi tư vấn nhé!',
      hashtags: ['#Gemral', '#TradingTools', '#Scanner', '#GiaiPhapTaiChinh', '#BanGiaTri'],
    },
    {
      content: '🥇 CON ĐƯỜNG TRỞ THÀNH MENTOR/TRAINER: THU NHẬP 9 CON SỐ\n\nBạn có kỹ năng Trading tốt (Win rate 75%+)? Bạn có đam mê chia sẻ?\n\nĐừng dừng lại ở việc làm CTV bán hàng. Hãy phấn đấu trở thành **Mentor** của Gemral.\n- Lương cứng: 15M - 40M/tháng.\n- Bonus đào tạo: 10-15% trên mỗi học viên.\n- Royalty (Bản quyền): 30% doanh thu từ content bạn tạo ra.\n\nĐây là nấc thang cao nhất trong sự nghiệp tại Gemral. Chúng tôi không chỉ tìm người bán hàng, chúng tôi tìm những người Thầy, những người Lãnh đạo. Hãy mài giũa kỹ năng trading và sư phạm ngay từ hôm nay.',
      hashtags: ['#Gemral', '#Mentor', '#Trainer', '#CareerPath', '#DinhCaoSuNghiep'],
    },
    {
      content: '⚖️ CÂN BẰNG GIỮA \"VẬT CHẤT\" VÀ \"TÂM LINH\"\n\nHệ sinh thái sản phẩm của chúng ta rất thú vị: Một bên là **Trading (Vật chất, Tiền bạc)**, một bên là **Healing/Thiền (Tâm linh, Tinh thần)**.\n\nĐừng nghĩ chúng mâu thuẫn. Chúng bổ trợ nhau. \n- Trader cần tâm tĩnh để giao dịch tốt -> Bán thêm đá, khóa thiền.\n- Người tu tập cũng cần tài chính để tự do -> Bán thêm khóa học tư duy, trading.\n\nLà một Partner của Gemral, bạn cần linh hoạt (Flexible). Đừng đóng khung khách hàng. Hãy nhìn thấy nhu cầu toàn diện của họ: Cần Tiền và Cần An.',
      hashtags: ['#Gemral', '#CanBang', '#TamLinhVaTaiChinh', '#CrossSell', '#HieuKhachHang'],
    },
    {
      content: '🎁 QUÀ TẶNG: KỊCH BẢN TƯ VẤN KHÓA HỌC TRADING \"BÁCH PHÁT BÁCH TRÚNG\"\n\nKhách hỏi: \"Bỏ 11 triệu ra học có chắc chắn lãi không em?\"\n\nBạn trả lời sao? \nA. \"Chắc chắn lãi ạ.\" (Sai! Đừng bao giờ cam kết lợi nhuận kiểu đó, mất uy tín).\nB. \"Em không biết.\" (Sai! Thể hiện sự thiếu chuyên nghiệp).\n\nCâu trả lời chuẩn: \"Dạ, trong đầu tư không có gì là 100%. Tuy nhiên, khóa học cung cấp PHƯƠNG PHÁP quản lý vốn và bộ công cụ Scanner giúp anh/chị tăng tỷ lệ thắng lên cao nhất. Học viên bên em tuân thủ kỷ luật đều có kết quả tốt...\"\n\nMình đã soạn sẵn bộ kịch bản xử lý từ chối cho các gói Bundle Trading. Partner nào cần inbox mình gửi nhé!',
      hashtags: ['#Gemral', '#KichBanSale', '#XuLyTuChoi', '#TradingCourse', '#TuVanChuyenNghiep'],
    },
    {
      content: '🌟 7 NGÀY KHAI MỞ TẦN SỐ GỐC: KHÓA HỌC \"MUST-TRY\"\n\nTrước khi bán khóa học giá 1.990.000đ này, bạn hãy học nó đi.\n\nTại sao? Vì đây là khóa học nền tảng nhất của Jennie Uyên Chu. Nó thay đổi tần số rung động của bạn. Khi tần số bạn thay đổi, việc bán hàng sẽ trở nên dễ dàng như hơi thở.\n\nBạn không thể bán sự chuyển hóa nếu chính bạn chưa chuyển hóa. Hãy trở thành \"Sản phẩm của sản phẩm\". Khi bạn thay đổi, bạn bè sẽ tự hỏi: \"Sao dạo này mày khác thế, năng lượng thế?\". Lúc đó, bạn chỉ cần đưa link khóa học cho họ.',
      hashtags: ['#Gemral', '#TanSoGoc', '#ChuyenHoa', '#TraiNghiemThat', '#BanHangTuNhien'],
    },
    {
      content: '🧱 XÂY DỰNG NỀN MÓNG TỪ CẤP ĐỘ \"BEGINNER\"\n\nĐừng coi thường cấp độ 1 (Beginner). Ai cũng phải bắt đầu từ đây. \n\nỞ cấp độ này, bạn nhận 10% hoa hồng + 3% đá. Tuy chưa cao, nhưng đây là lúc bạn:\n- Học sản phẩm.\n- Rèn kỹ năng tư vấn.\n- Xây dựng tệp khách hàng đầu tiên.\n\nĐừng vội nhìn lên đỉnh núi mà nản lòng. Hãy tập trung đi thật vững những bước đầu tiên. Gemral có đầy đủ tài liệu, video training hỗ trợ bạn. Chỉ cần bạn chịu đi, đường sẽ mở.',
      hashtags: ['#Gemral', '#Newbie', '#BatDau', '#KienThucNenTang', '#KienTri'],
    },
    {
      content: '💎 GRAND PARTNER: KHÔNG CHỈ LÀ TIỀN, MÀ LÀ VỊ THẾ\n\nKhi bạn đạt cấp **Grand Partner** (Doanh số tích lũy 600M), bạn không chỉ nhận hoa hồng 30%.\n\nBạn được:\n- Làm việc trực tiếp với đội ngũ Core Team.\n- Tham gia các buổi họp chiến lược kín.\n- Có cơ hội trở thành cổ đông hoặc Mentor.\n\nĐây là vị thế của một người làm chủ cuộc chơi. Hãy đặt mục tiêu lên Grand trong vòng 6-12 tháng. Nó hoàn toàn khả thi nếu bạn có chiến lược đúng đắn.',
      hashtags: ['#Gemral', '#GrandPartner', '#ViThe', '#LanhDao', '#TamNhinDaiHan'],
    },
    {
      content: '🔄 TÍCH LŨY DOANH SỐ: CƠ CHẾ NHÂN VĂN NHẤT CỦA GEMRAL\n\nNhiều hệ thống khác ép doanh số tháng, không đạt là rớt hạng (reset). Áp lực kinh khủng!\n\nTại Gemral, chúng tôi hiểu ai cũng có lúc bận rộn, lúc ốm đau. Vì thế, cơ chế thăng cấp dựa trên **TỔNG DOANH SỐ TÍCH LŨY**.\n\nBạn bán được 10 triệu tháng này, tháng sau bán 20 triệu -> Tổng là 30 triệu. Cứ thế cộng dồn cho đến khi đủ mốc lên cấp. Không bao giờ mất đi công sức của bạn.\n\nĐây là chính sách để bạn yên tâm xây dựng sự nghiệp bền vững, không áp lực, không ôm hàng.',
      hashtags: ['#Gemral', '#ChinhSachNhanVan', '#KhongApLuc', '#BenVung', '#DoiTac'],
    },
    {
      content: '💰 TẠI SAO BÁN GÓI 68 TRIỆU LẠI DỄ HƠN BÁN GÓI 11 TRIỆU?\n\nNghịch lý trong kinh doanh High-ticket: Bán cho người giàu đôi khi dễ hơn bán cho người ít tiền.\n\n- Gói lẻ: Scanner (6tr) + Chatbot (Unlimited) mua rời trong 2 năm sẽ tốn hơn 100 triệu.\n- Gói Tier 3: Trọn gói 2 năm chỉ 68 triệu. **Tiết kiệm gần 40%**.\n\nĐây là gói dành cho những Trader xác định đi đường dài (Career Trader). Khi bạn bán được 1 gói này:\n- Bạn giúp khách hàng tiết kiệm cả đống tiền công cụ.\n- Bạn (nếu là Grand Partner) nhận hoa hồng **20.400.000đ** (30%).\n\nBán 1 đơn bằng người khác đi làm cả 2 tháng. Tại sao không dám thử tư vấn gói VIP?',
      hashtags: ['#Gemral', '#HighTicketClosing', '#TuDuyDauTu', '#GiaTriThuc', '#BanHangGiaCao'],
    },
    {
      content: '✨ TỪ KHÓA HỌC TÌNH YÊU ĐẾN TỰ DO TÀI CHÍNH\n\nNhiều bạn nữ đến với Gemral ban đầu chỉ vì muốn học khóa **\"Kích hoạt tần số tình yêu\"** (399k) để chữa lành mối quan hệ.\n\nNhưng sau khi học, họ nhận ra: Muốn hạnh phúc, phụ nữ cần tự chủ. Thế là họ đăng ký làm CTV, bán đá, bán khóa học. Dần dần họ học thêm về đầu tư, trading.\n\nGiờ đây, họ không chỉ hạnh phúc trong tình yêu mà còn tự do về tài chính. Gemral không chỉ dạy kiếm tiền, Gemral chuyển hóa cuộc đời. \n\nHãy chia sẻ câu chuyện chuyển hóa đó, bạn sẽ chạm đến trái tim của rất nhiều người phụ nữ ngoài kia.',
      hashtags: ['#Gemral', '#PhuNuKhiChat', '#TuChuTaiChinh', '#HanhPhuc', '#ChuyenHoa'],
    },
    {
      content: '🛠 CÔNG CỤ HỖ TRỢ TẬN RĂNG\n\nLàm Partner của Gemral, bạn không phải lo thiết kế ảnh, không lo viết bài mẫu, không lo soạn slide.\n\nTrong kho tài nguyên Partner có sẵn:\n- Ảnh sản phẩm lung linh.\n- Video review đá, demo scanner.\n- Bài viết mẫu cho từng loại sản phẩm.\n- Landing page chốt sale chuyên nghiệp.\n\nViệc của bạn chỉ là: **Tải về -> Đăng lên/Gửi khách -> Tư vấn -> Chốt**. \nChúng tôi đã dọn sẵn cỗ, bạn chỉ việc mời khách vào tiệc thôi!',
      hashtags: ['#Gemral', '#HoTroDoiTac', '#MarketingKit', '#DungCuKinhDoanh', '#DeDang'],
    },
    {
      content: '🛑 ĐỪNG CHỈ NHÌN VÀO % HOA HỒNG, HÃY NHÌN VÀO SỐ TIỀN THỰC NHẬN\n\n30% của 1 món hàng 100k là 30k.\n10% của 1 gói đầu tư 11 triệu là 1.1 triệu.\n\nĐừng chê % thấp ở các cấp bậc đầu. Hãy nhìn vào giá trị đơn hàng (AOV) của Gemral. Chúng ta bán những sản phẩm giá trị cao, nên dù % khởi điểm là 10% thì số tiền thực nhận vẫn rất lớn so với bán quần áo, mỹ phẩm.\n\nHãy làm bài toán kinh tế thông minh. Làm ít, hưởng nhiều nhờ bán sản phẩm giá trị cao.',
      hashtags: ['#Gemral', '#BaiToanKinhTe', '#ThuNhapThucTe', '#SmartChoice', '#Affiliate'],
    },
    {
      content: '🔮 BẠN ĐANG Ở ĐÚNG THỜI ĐIỂM VÀNG\n\nThị trường Crypto đang ấm lại. Nhu cầu chữa lành tâm thức đang bùng nổ sau đại dịch. \n\nGemral hội tụ cả 2 yếu tố thiên thời này: **Trading + Healing**.\n\nTrở thành đối tác của Gemral ngay lúc này là bạn đang đón đầu con sóng. Đừng đợi đến khi ai cũng làm rồi mới nhảy vào. Người đi tiên phong luôn là người chiếm lĩnh thị phần lớn nhất.\n\nĐăng ký ngay hôm nay để giữ vị trí của mình trong cộng đồng thịnh vượng này!',
      hashtags: ['#Gemral', '#ThoiDiemVang', '#CoHoi', '#Trend2025', '#HanhDongNgay'],
    },
    {
      content: '👋 HÀNH TRÌNH VẠN DẶM BẮT ĐẦU TỪ MỘT BƯỚC CHÂN\n\nChúng ta đã đi qua tư duy, kỹ năng, và giờ là chính sách cụ thể.\n\nMọi thứ đã sẵn sàng. Công cụ có, sản phẩm tốt, cơ chế thưởng hậu hĩnh.\n\nThứ duy nhất còn thiếu là **HÀNH ĐỘNG** của bạn.\n\nHãy inbox ngay cho Admin hoặc người giới thiệu bạn để lấy link đăng ký Partner. Đừng chần chừ nữa. Tương lai thịnh vượng của bạn đang chờ ở phía trước.\n\nHẹn gặp lại các bạn ở đỉnh vinh quang! Gemral xin chào! ❤️💎',
      hashtags: ['#Gemral', '#KetThucChuoiBai', '#CallToAction', '#KhoiDauMoi', '#ThinhVuong'],
    },
  ],
};

// Track used images globally to prevent duplicates across posts
let usedImageUrls = new Set();

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
 * Fill trading post template with variables
 * @param {string} template - Post template
 * @returns {string}
 */
const fillTradingTemplate = (template) => {
  const coin = getRandomItem(TRADING_VARIABLES.coins);
  const timeframe = getRandomItem(TRADING_VARIABLES.timeframes);
  const indicator = getRandomItem(TRADING_VARIABLES.indicators);
  const signal = getRandomItem(TRADING_VARIABLES.signals);
  const pattern = getRandomItem(TRADING_VARIABLES.patterns);
  const analysis = getRandomItem(TRADING_VARIABLES.analysis);
  const strategy = getRandomItem(TRADING_VARIABLES.strategies);

  // Generate prices
  const basePrice = getRandomFloat(0.1, 100000, 2);
  const targetPrice = basePrice * getRandomFloat(1.05, 1.50, 2);
  const stopLoss = basePrice * getRandomFloat(0.90, 0.98, 2);
  const exitPrice = targetPrice * getRandomFloat(0.95, 1.05, 2);
  const profit = getRandomNumber(5, 50);

  return template
    .replace(/{coin}/g, coin)
    .replace(/{coin_tag}/g, coin.toLowerCase())
    .replace(/{timeframe}/g, timeframe)
    .replace(/{indicator}/g, indicator)
    .replace(/{signal}/g, signal)
    .replace(/{pattern}/g, pattern)
    .replace(/{analysis}/g, analysis)
    .replace(/{strategy}/g, strategy)
    .replace(/{price_area}/g, `$${basePrice.toLocaleString()}`)
    .replace(/{target}/g, `$${targetPrice.toLocaleString()}`)
    .replace(/{stoploss}/g, `$${stopLoss.toLocaleString()}`)
    .replace(/{entry}/g, basePrice.toLocaleString())
    .replace(/{exit}/g, exitPrice.toLocaleString())
    .replace(/{profit}/g, String(profit))
    .replace(/{duration}/g, `${getRandomNumber(1, 7)} ngày`)
    .replace(/{level}/g, `$${basePrice.toLocaleString()}`)
    .replace(/{btc_status}/g, getRandomItem(TRADING_VARIABLES.btc_status).replace('$X', `$${getRandomNumber(60000, 100000).toLocaleString()}`))
    .replace(/{eth_status}/g, getRandomItem(TRADING_VARIABLES.eth_status))
    .replace(/{alts_status}/g, getRandomItem(TRADING_VARIABLES.alts_status))
    .replace(/{tip1}/g, getRandomItem(TRADING_VARIABLES.tips))
    .replace(/{tip2}/g, getRandomItem(TRADING_VARIABLES.tips))
    .replace(/{tip3}/g, getRandomItem(TRADING_VARIABLES.tips))
    .replace(/{mistake1}/g, getRandomItem(TRADING_VARIABLES.mistakes))
    .replace(/{mistake2}/g, getRandomItem(TRADING_VARIABLES.mistakes))
    .replace(/{mistake3}/g, getRandomItem(TRADING_VARIABLES.mistakes))
    .replace(/{description}/g, analysis)
    .replace(/{emoji}/g, getRandomItem(['📈', '📊', '💹', '🎯', '✅']));
};

/**
 * Fill crystal post template with variables
 * @param {string} template - Post template
 * @returns {string}
 */
const fillCrystalTemplate = (template) => {
  const crystal = getRandomItem(CRYSTAL_VARIABLES.crystals);
  const purpose = getRandomItem(CRYSTAL_VARIABLES.purposes);
  const benefits = getRandomItems(CRYSTAL_VARIABLES.benefits, 3);
  const element = getRandomItem(CRYSTAL_VARIABLES.elements);
  const methods = getRandomItems(CRYSTAL_VARIABLES.cleansing_methods, 3);
  const rating = getRandomItem(CRYSTAL_VARIABLES.ratings);

  return template
    .replace(/{crystal}/g, crystal)
    .replace(/{crystal_tag}/g, crystal.split(' ')[0].toLowerCase().replace(/[^a-z]/g, ''))
    .replace(/{purpose}/g, purpose)
    .replace(/{benefit1}/g, benefits[0])
    .replace(/{benefit2}/g, benefits[1])
    .replace(/{benefit3}/g, benefits[2])
    .replace(/{element}/g, element)
    .replace(/{method1}/g, methods[0])
    .replace(/{method2}/g, methods[1])
    .replace(/{method3}/g, methods[2])
    .replace(/{description}/g, `Viên đá ${crystal} với năng lượng ${purpose}`)
    .replace(/{experience}/g, `Sau khi sử dụng, mình cảm thấy ${getRandomItem(['bình an hơn', 'tập trung hơn', 'năng lượng tốt hơn', 'ngủ ngon hơn'])}`)
    .replace(/{review}/g, `Đá đẹp, năng lượng tốt, giao hàng nhanh`)
    .replace(/{rating}/g, rating)
    .replace(/{duration}/g, `${getRandomNumber(1, 6)} tháng`)
    .replace(/{tip1}/g, `Kiểm tra độ trong suốt`)
    .replace(/{tip2}/g, `Cảm nhận năng lượng khi cầm`)
    .replace(/{tip3}/g, `Mua từ nguồn uy tín`)
    .replace(/{item1}/g, getRandomItem(CRYSTAL_VARIABLES.crystals))
    .replace(/{item2}/g, getRandomItem(CRYSTAL_VARIABLES.crystals))
    .replace(/{item3}/g, getRandomItem(CRYSTAL_VARIABLES.crystals))
    .replace(/{emoji}/g, getRandomItem(['💎', '✨', '🔮', '💜', '🧿']));
};

/**
 * Fill LOA post template with variables
 * @param {string} template - Post template
 * @returns {string}
 */
const fillLoaTemplate = (template) => {
  const affirmations = getRandomItems(LOA_VARIABLES.affirmations, 3);
  const technique = getRandomItem(LOA_VARIABLES.techniques);
  const goal = getRandomItem(LOA_VARIABLES.goals);
  const achievement = getRandomItem(LOA_VARIABLES.achievements);
  const mistakes = getRandomItems(LOA_VARIABLES.mistakes, 3);

  return template
    .replace(/{affirmation}/g, getRandomItem(LOA_VARIABLES.affirmations))
    .replace(/{aff1}/g, affirmations[0])
    .replace(/{aff2}/g, affirmations[1])
    .replace(/{aff3}/g, affirmations[2])
    .replace(/{technique}/g, technique)
    .replace(/{goal}/g, goal)
    .replace(/{achievement}/g, achievement)
    .replace(/{story}/g, `Mình đã áp dụng LOA và manifest được ${achievement}. Ban đầu mình cũng không tin, nhưng sau khi thực hành đều đặn...`)
    .replace(/{process}/g, `Mình đã visualize mỗi ngày 10 phút, viết gratitude journal, và tin tưởng vào vũ trụ`)
    .replace(/{step1}/g, `Xác định rõ mục tiêu`)
    .replace(/{step2}/g, `Visualize như đã đạt được`)
    .replace(/{step3}/g, `Hành động theo inspired action`)
    .replace(/{step4}/g, `Tin tưởng và letting go`)
    .replace(/{mistake1}/g, mistakes[0])
    .replace(/{mistake2}/g, mistakes[1])
    .replace(/{mistake3}/g, mistakes[2])
    .replace(/{item1}/g, getRandomItem(['Sức khoẻ tốt', 'Gia đình hạnh phúc', 'Công việc thuận lợi']))
    .replace(/{item2}/g, getRandomItem(['Được học hỏi', 'Có cộng đồng tốt', 'Tài chính ổn định']))
    .replace(/{item3}/g, getRandomItem(['Sự bình an', 'Những người yêu thương', 'Cơ hội mới']))
    .replace(/{gratitude}/g, `Những điều nhỏ nhặt trong cuộc sống đều đáng trân trọng`)
    .replace(/{description}/g, `Kỹ thuật ${technique} giúp bạn manifest hiệu quả hơn...`);
};

/**
 * Fill education post template with variables
 * @param {string} template - Post template
 * @returns {string}
 */
const fillEducationTemplate = (template) => {
  const topics = ['trading', 'phong thuỷ', 'LOA', 'đầu tư', 'tâm linh', 'crystal healing'];
  const topic = getRandomItem(topics);

  return template
    .replace(/{course_name}/g, `Khoá học ${topic} cơ bản`)
    .replace(/{topic}/g, topic)
    .replace(/{review}/g, `Khoá học rất hay và chi tiết, giảng viên giảng dễ hiểu`)
    .replace(/{learnings}/g, `Học được rất nhiều kiến thức bổ ích về ${topic}`)
    .replace(/{content}/g, `Chia sẻ kiến thức cơ bản về ${topic} cho người mới bắt đầu...`)
    .replace(/{count}/g, String(getRandomNumber(3, 10)))
    .replace(/{point1}/g, `Tìm hiểu kỹ trước khi bắt đầu`)
    .replace(/{point2}/g, `Thực hành đều đặn`)
    .replace(/{point3}/g, `Học hỏi từ cộng đồng`)
    .replace(/{resource1}/g, `YouTube channels về ${topic}`)
    .replace(/{resource2}/g, `Sách tiếng Việt về ${topic}`)
    .replace(/{resource3}/g, `Courses trên Gemral`)
    .replace(/{book_name}/g, `Cẩm nang ${topic}`)
    .replace(/{author}/g, getRandomItem(['Tác giả Việt Nam', 'Dịch giả uy tín']));
};

/**
 * Fill wealth post template with variables
 * @param {string} template - Post template
 * @returns {string}
 */
const fillWealthTemplate = (template) => {
  const quotes = [
    'Tiền bạc không phải tất cả, nhưng nó mang lại tự do',
    'Đầu tư vào bản thân là khoản đầu tư tốt nhất',
    'Giàu có bắt đầu từ tư duy',
    'Tự do tài chính là mục tiêu, không phải xa xỉ',
  ];
  const habits = [
    'Đọc sách mỗi ngày', 'Dậy sớm', 'Tập thể dục đều đặn',
    'Quản lý thời gian hiệu quả', 'Network với người thành công',
    'Tiết kiệm trước, tiêu sau', 'Đầu tư đều đặn',
  ];

  return template
    .replace(/{quote}/g, getRandomItem(quotes))
    .replace(/{count}/g, String(getRandomNumber(3, 7)))
    .replace(/{habit1}/g, getRandomItem(habits))
    .replace(/{habit2}/g, getRandomItem(habits))
    .replace(/{habit3}/g, getRandomItem(habits))
    .replace(/{portfolio}/g, `40% Crypto, 30% Stocks, 20% Real Estate, 10% Cash`)
    .replace(/{year}/g, String(new Date().getFullYear()))
    .replace(/{goal1}/g, `Tiết kiệm X triệu/tháng`)
    .replace(/{goal2}/g, `Tăng thu nhập passive`)
    .replace(/{goal3}/g, `Học thêm kỹ năng mới`)
    .replace(/{tips}/g, `Quy tắc 50/30/20: 50% nhu cầu, 30% mong muốn, 20% tiết kiệm`);
};

/**
 * Fill affiliate post template with variables
 * @param {string} template - Post template
 * @returns {string}
 */
const fillAffiliateTemplate = (template) => {
  const amount = `${getRandomNumber(5, 50)} triệu`;

  return template
    .replace(/{description}/g, `Chương trình affiliate với commission hấp dẫn, sản phẩm chất lượng`)
    .replace(/{amount}/g, amount)
    .replace(/{breakdown}/g, `- Sản phẩm A: ${getRandomNumber(1, 10)} triệu\n- Sản phẩm B: ${getRandomNumber(1, 10)} triệu\n- Referral bonus: ${getRandomNumber(1, 5)} triệu`)
    .replace(/{tip1}/g, `Chọn sản phẩm mình thực sự tin tưởng`)
    .replace(/{tip2}/g, `Build trust với audience trước`)
    .replace(/{tip3}/g, `Chia sẻ trải nghiệm thật, không nói quá`)
    .replace(/{mistakes}/g, `Spam link, không có giá trị, bán hàng quá aggressive`);
};

/**
 * Fill post template based on topic
 * @param {string} template - Post template
 * @param {string} topic - Post topic
 * @returns {string}
 */
const fillTemplate = (template, topic) => {
  switch (topic) {
    case 'trading':
      return fillTradingTemplate(template);
    case 'crystal':
      return fillCrystalTemplate(template);
    case 'loa':
      return fillLoaTemplate(template);
    case 'education':
      return fillEducationTemplate(template);
    case 'wealth':
      return fillWealthTemplate(template);
    case 'affiliate':
      return fillAffiliateTemplate(template);
    default:
      return template;
  }
};

/**
 * Reset used images tracker (call before generating new batch)
 */
export const resetUsedImages = () => {
  usedImageUrls = new Set();
  console.log('[SeedPostGenerator] Reset used images tracker');
};

/**
 * Check if image URL is acceptable quality
 * SYNCED with Python script parse_new_images.py
 *
 * Accept: originals/, 736x, 236x (medium but good for social media)
 * Reject: 75x75, 150x150, 60x60, 140x140 (too small/blurry)
 */
const isHighQualityImage = (url) => {
  if (!url) return false;

  // Must contain pinimg.com for Pinterest images
  if (url.includes('pinimg.com')) {
    // Reject very low quality thumbnails
    const lowQualityPatterns = ['75x75', '150x150', '/60x60/', '/140x140/'];
    for (const pattern of lowQualityPatterns) {
      if (url.includes(pattern)) return false;
    }

    // Accept good quality patterns (including 236x which is decent for social media)
    const acceptablePatterns = ['originals/', '/736x/', '/236x/'];
    for (const pattern of acceptablePatterns) {
      if (url.includes(pattern)) return true;
    }

    // Reject 474x (awkward size) and unknown patterns
    return false;
  }

  // Non-Pinterest URLs: accept by default
  return true;
};

/**
 * Category-specific fallback images:
 * - trading: strictly use trading images only (crypto/chart content)
 * - crystal: strictly use crystal images only (gemstone content)
 * - loa/education/affiliate: fall back to wealth images (success/inspiration theme)
 */
const TOPIC_FALLBACK = {
  trading: 'trading',  // No fallback - must use trading
  crystal: 'crystal',  // No fallback - must use crystal
  loa: 'wealth',       // Law of Attraction falls back to wealth (success theme)
  education: 'wealth', // Education falls back to wealth (growth theme)
  affiliate: 'wealth', // Affiliate/business falls back to wealth (money theme)
  wealth: 'wealth',    // Wealth uses itself
};

/**
 * Generate images for a post - WITH DEDUPLICATION + QUALITY FILTER + SMART FALLBACK + GENDER
 * Every post has at least 1 image, some have 2-4 images
 *
 * CRITICAL RULE for topic-specific images:
 * - trading: ONLY use trading images (crypto/chart content) - NO FALLBACK
 * - crystal: ONLY use crystal images (gemstone content) - NO FALLBACK
 * - loa/education/affiliate: can fallback to wealth images
 *
 * @param {string} topic - Post topic
 * @param {'male' | 'female'} gender - User's gender (detected from avatar)
 * @returns {Array<string>}
 */
const generatePostImages = (topic, gender = 'male') => {
  // Normalize topic
  const normalizedTopic = (topic || 'wealth').toLowerCase();
  const normalizedGender = gender === 'female' ? 'female' : 'male';

  // Use GENDER_POST_IMAGES as primary source (gender-specific images)
  const genderImages = GENDER_POST_IMAGES[normalizedTopic]?.[normalizedGender] || [];

  // Fallback to SAMPLE_IMAGES if gender-specific images not available
  const rawTopicImages = genderImages.length > 0 ? genderImages : (SAMPLE_IMAGES[normalizedTopic] || []);
  let topicImages = rawTopicImages.filter(isHighQualityImage);

  // STRICT MODE: trading and crystal NEVER fall back to other categories
  const strictTopics = ['trading', 'crystal'];
  const isStrictTopic = strictTopics.includes(normalizedTopic);

  // If topic has few/no high-quality images, use fallback category (ONLY for non-strict topics)
  if (topicImages.length < 5 && !isStrictTopic) {
    const fallbackTopic = TOPIC_FALLBACK[normalizedTopic] || 'wealth';
    if (fallbackTopic !== normalizedTopic) {
      // Try gender-specific fallback first, then SAMPLE_IMAGES
      const genderFallbackImages = GENDER_POST_IMAGES[fallbackTopic]?.[normalizedGender] || [];
      const rawFallbackImages = genderFallbackImages.length > 0 ? genderFallbackImages : (SAMPLE_IMAGES[fallbackTopic] || []);
      const fallbackImages = rawFallbackImages.filter(isHighQualityImage);
      // Combine topic images with fallback images
      topicImages = [...topicImages, ...fallbackImages];
      console.log(`[SeedPostGenerator] ${normalizedTopic} (${normalizedGender}) has few images, using ${fallbackTopic} as fallback (${topicImages.length} total)`);
    }
  }

  // Log strict topic image count for debugging
  if (isStrictTopic) {
    console.log(`[SeedPostGenerator] STRICT MODE: ${normalizedTopic} using ONLY ${topicImages.length} topic-specific images`);
  }

  // Filter out already used images from this pool
  const availableTopicImages = topicImages.filter(url => !usedImageUrls.has(url));

  // Prefer to reuse topic-specific images rather than using images from other categories
  let imagePool;

  if (availableTopicImages.length > 0) {
    // Use available topic images
    imagePool = availableTopicImages;
  } else {
    // If all topic images are used, reset tracker for this topic and reuse them
    console.log(`[SeedPostGenerator] Reusing ${normalizedTopic} images (all ${topicImages.length} used)`);
    // Only clear used images that belong to this topic
    topicImages.forEach(url => usedImageUrls.delete(url));
    imagePool = topicImages;
  }

  // Fallback if topic has no images at all
  // ONLY use wealth fallback for non-strict topics
  if (imagePool.length === 0) {
    if (isStrictTopic) {
      // For strict topics, use the topic's own images even if empty (will be empty result)
      console.warn(`[SeedPostGenerator] WARNING: ${normalizedTopic} has NO images! Posts will have no images.`);
      imagePool = [];
    } else {
      console.log(`[SeedPostGenerator] No images for topic (${normalizedGender}), using wealth images`);
      // Try gender-specific wealth images first
      const genderWealthImages = GENDER_POST_IMAGES.wealth?.[normalizedGender] || [];
      const wealthImages = genderWealthImages.length > 0
        ? genderWealthImages.filter(isHighQualityImage)
        : (SAMPLE_IMAGES.wealth || []).filter(isHighQualityImage);
      imagePool = wealthImages.length > 0 ? wealthImages : Object.values(SAMPLE_IMAGES).flat().filter(isHighQualityImage);
    }
  }

  // Determine number of images for this post:
  // UPDATED: Always 2-4 images (no single image posts)
  // 40% have 2 images, 35% have 3 images, 25% have 4 images
  const rand = Math.random();
  let imageCount;
  if (rand < 0.40) {
    imageCount = 2;
  } else if (rand < 0.75) {
    imageCount = 3;
  } else {
    imageCount = 4;
  }

  // Don't exceed available images (but ensure minimum 2)
  imageCount = Math.min(imageCount, Math.max(2, imagePool.length));

  // Shuffle and select images
  const shuffled = [...imagePool].sort(() => Math.random() - 0.5);
  let selectedImages = shuffled.slice(0, imageCount);

  // SPECIAL RULE: Crystal and LOA (law of attraction) topics must include at least 1 crystal image
  // This ensures visual consistency for spiritual/crystal content for BOTH genders
  const crystalRelatedTopics = ['crystal', 'loa'];
  if (crystalRelatedTopics.includes(normalizedTopic)) {
    // Get crystal images for this SPECIFIC gender (male or female)
    const crystalImages = GENDER_POST_IMAGES.crystal?.[normalizedGender] || [];

    console.log(`[SeedPostGenerator] Crystal check for ${normalizedTopic} (${normalizedGender}): ${crystalImages.length} crystal images available`);

    // Check if we already have a crystal image (for 'crystal' topic, all images are already crystal)
    const hasCrystalImage = selectedImages.some(url => crystalImages.includes(url));

    // If no crystal image and crystal images are available, add one
    if (!hasCrystalImage && crystalImages.length > 0) {
      // Get crystal images not already selected
      const availableCrystalImages = crystalImages.filter(url => !selectedImages.includes(url) && !usedImageUrls.has(url));

      // Fallback to all crystal images if all are used
      const crystalPool = availableCrystalImages.length > 0 ? availableCrystalImages : crystalImages;

      // Pick a random crystal image
      const randomCrystalImage = crystalPool[Math.floor(Math.random() * crystalPool.length)];

      // Replace a random position (not always last) for more natural appearance
      const replaceIndex = Math.floor(Math.random() * selectedImages.length);
      selectedImages[replaceIndex] = randomCrystalImage;

      console.log(`[SeedPostGenerator] ✅ Added crystal image to ${normalizedTopic} post (${normalizedGender}) at position ${replaceIndex + 1}/${selectedImages.length}`);
    } else if (hasCrystalImage) {
      console.log(`[SeedPostGenerator] ✅ ${normalizedTopic} post (${normalizedGender}) already has crystal image`);
    }
  }

  // Mark all selected as used
  selectedImages.forEach(url => usedImageUrls.add(url));

  return selectedImages;
};

/**
 * Generate post data
 * @param {Object} options - Options
 * @param {string} options.authorId - User ID of post author
 * @param {string} options.topic - Post topic
 * @param {Date} options.createdAt - Post creation date
 * @param {string} [options.avatarUrl] - Author's avatar URL (for gender detection)
 * @returns {Object}
 */
const generatePostData = ({
  authorId,
  topic,
  createdAt,
  avatarUrl,
  postIndex = 0, // Used to ensure uniqueness
}) => {
  // Detect gender from avatar URL for gender-specific images
  const gender = detectGenderFromAvatar(avatarUrl);

  // Use SAMPLE_POSTS (new content from category files) instead of POST_TEMPLATES
  const posts = SAMPLE_POSTS[topic] || SAMPLE_POSTS.trading;
  const post = getRandomItem(posts);
  const rawContent = post.content;
  const hashtags = post.hashtags || [];

  // Append hashtags to content (add newlines before hashtags)
  const hashtagString = hashtags.length > 0 ? '\n\n' + hashtags.join(' ') : '';

  // Content = raw text + hashtags (no invisible markers — they were visible in PostCard)
  const fullContent = rawContent + hashtagString;

  // Sanitize content to remove invalid unicode surrogates
  const content = sanitizeText(fullContent);

  // All posts have at least 1 image (some have 2-4 images) - gender-matched
  const images = generatePostImages(topic, gender);

  // Use image_url for single image or media_urls for multiple
  // Matching actual forum_posts table structure
  const imageUrl = images[0] || null;

  // Title = first 90 chars of content (no #N suffix — it was visible in PostCard)
  const baseTitle = sanitizeText(rawContent.substring(0, 90));

  // Insert into seed_posts table (separate from forum_posts to avoid FK constraint)
  return {
    user_id: authorId,
    content,
    title: baseTitle,
    image_url: imageUrl,
    media_urls: images.length > 0 ? images : [],
    seed_topic: topic,
    created_at: createdAt.toISOString(),
    updated_at: createdAt.toISOString(),
    likes_count: 0,
    comments_count: 0,
    views_count: getRandomNumber(50, 500),
    is_pinned: false,
    status: 'published',
    feed_type: 'general',
  };
};

/**
 * Generate seed posts
 * @param {Object} options - Generation options
 * @returns {Promise<Object>}
 */
export const generate = async ({
  postCount = 450,
  topicDistribution = TOPIC_WEIGHTS,
  premiumPostsPerUser = { min: 5, max: 10 },
  regularPostsPerUser = { min: 0, max: 5 },
  backdateDays = 30,
  onProgress = null,
  generatedBy = null,
} = {}) => {
  console.log(`[SeedPostGenerator] Starting generation of ${postCount} posts`);

  // Reset used images to prevent duplicates in this batch
  usedImageUrls.clear();
  console.log('[SeedPostGenerator] Cleared used images tracker');

  const results = {
    generated: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Get seed users
    if (onProgress) {
      onProgress({
        phase: 'fetching_users',
        message: 'Đang tải danh sách seed users...',
        current: 0,
        total: postCount,
      });
    }

    const premiumUsers = await getPremiumSeedUsers();
    console.log(`[SeedPostGenerator] Found ${premiumUsers.length} premium users`);

    if (premiumUsers.length === 0) {
      throw new Error('Không tìm thấy premium seed users. Vui lòng generate users trước.');
    }

    // Get some regular users from seed_users table
    const { data: regularUsers } = await supabase
      .from('seed_users')
      .select('id, seed_persona')
      .eq('is_premium_seed', false)
      .eq('bot_enabled', true)
      .limit(400);

    console.log(`[SeedPostGenerator] Found ${regularUsers?.length || 0} regular users`);

    // Calculate post distribution
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - backdateDays);

    // Generate posts - ENSURE we create exactly postCount posts
    const posts = [];

    // Combine all users for post distribution
    const allUsers = [...premiumUsers, ...(regularUsers || [])];

    if (allUsers.length === 0) {
      throw new Error('Không có seed users để tạo posts. Vui lòng generate users trước.');
    }

    console.log(`[SeedPostGenerator] Using ${allUsers.length} users to generate ${postCount} posts`);

    // Generate exactly postCount posts by cycling through users
    let userIndex = 0;
    for (let i = 0; i < postCount; i++) {
      const user = allUsers[userIndex % allUsers.length];
      const preferredTopics = PERSONA_TOPIC_PREFERENCE[user.seed_persona] || Object.keys(TOPIC_WEIGHTS);

      // 70% from preferred topics, 30% random
      const topic = Math.random() < 0.7
        ? getRandomItem(preferredTopics)
        : getTopicByDistribution();

      const createdAt = getRandomDate(startDate, now);

      posts.push(generatePostData({
        authorId: user.id,
        topic,
        createdAt,
        avatarUrl: user.avatar_url, // For gender-specific image selection
        postIndex: i, // Used to ensure uniqueness in title/content
      }));

      // Move to next user (cycle through all users)
      userIndex++;
    }

    // Shuffle posts to mix different users' posts
    posts.sort(() => Math.random() - 0.5);
    const finalPosts = posts;

    console.log(`[SeedPostGenerator] Generated ${finalPosts.length} posts, inserting in batches...`);

    // Insert in batches
    const totalBatches = Math.ceil(finalPosts.length / BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, finalPosts.length);
      const batch = finalPosts.slice(start, end);

      if (onProgress) {
        onProgress({
          phase: 'inserting',
          message: `Đang tạo posts (${start + 1}-${end}/${finalPosts.length})...`,
          current: start,
          total: finalPosts.length,
        });
      }

      try {
        const { data, error } = await supabase
          .from('seed_posts')
          .insert(batch)
          .select('id');

        if (error) {
          console.error(`[SeedPostGenerator] Batch ${batchIndex + 1} error:`, error);
          results.failed += batch.length;
          results.errors.push({
            batch: batchIndex + 1,
            error: error.message,
          });
        } else {
          results.generated += data?.length || batch.length;
        }
      } catch (batchError) {
        console.error(`[SeedPostGenerator] Batch ${batchIndex + 1} exception:`, batchError);
        results.failed += batch.length;
        results.errors.push({
          batch: batchIndex + 1,
          error: batchError.message,
        });
      }

      // Small delay between batches
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Log generation
    await logGeneration({
      generationType: 'posts',
      countGenerated: results.generated,
      countFailed: results.failed,
      parameters: {
        postCount,
        backdateDays,
        premiumPostsPerUser,
        regularPostsPerUser,
      },
      errorDetails: results.errors.length > 0 ? results.errors : null,
      generatedBy,
    });

    if (onProgress) {
      onProgress({
        phase: 'completed',
        message: `Hoàn thành! Đã tạo ${results.generated} posts.`,
        current: results.generated,
        total: postCount,
      });
    }

    console.log(`[SeedPostGenerator] Generation completed: ${results.generated} created, ${results.failed} failed`);

    return results;
  } catch (error) {
    console.error('[SeedPostGenerator] Generation error:', error);
    results.errors.push({
      type: 'general',
      error: error.message,
    });

    await logGeneration({
      generationType: 'posts',
      countGenerated: results.generated,
      countFailed: results.failed + (postCount - results.generated - results.failed),
      parameters: { postCount, backdateDays },
      errorDetails: results.errors,
      generatedBy,
    });

    throw error;
  }
};

/**
 * Get all seed posts
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
export const getSeedPosts = async ({
  topic = null,
  limit = 100,
  offset = 0,
} = {}) => {
  try {
    let query = supabase
      .from('seed_posts')
      .select('id, user_id, content, image_url, media_urls, seed_topic, created_at, likes_count, comments_count')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (topic) {
      query = query.eq('seed_topic', topic);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[SeedPostGenerator] getSeedPosts error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[SeedPostGenerator] getSeedPosts error:', error);
    return [];
  }
};

/**
 * Get seed posts by author
 * @param {string} authorId - Author ID
 * @param {number} limit - Max posts to return
 * @returns {Promise<Array>}
 */
export const getSeedPostsByAuthor = async (authorId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('seed_posts')
      .select('id, content, image_url, media_urls, seed_topic, created_at, likes_count, comments_count')
      .eq('user_id', authorId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[SeedPostGenerator] getSeedPostsByAuthor error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[SeedPostGenerator] getSeedPostsByAuthor error:', error);
    return [];
  }
};

export default {
  generate,
  getSeedPosts,
  getSeedPostsByAuthor,
};
