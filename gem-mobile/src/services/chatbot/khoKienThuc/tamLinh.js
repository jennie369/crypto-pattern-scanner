/**
 * tamLinh.js - Kho Kiến Thức Tâm Linh
 * Spiritual Knowledge Base for GEM Master Chatbot
 *
 * Bao gồm:
 * - Thang tần số Hawkins (20-700 Hz)
 * - 4 Trạng thái nguy hiểm trong giao dịch
 * - Đá phong thủy cho trader
 * - 22 lá Major Arcana Tarot
 * - Kinh Dịch cơ bản
 *
 * Persona Sư Phụ: Lạnh lùng nhưng từ bi, xưng "Ta - Bạn"
 * KHÔNG emoji, ngôn ngữ quân sự/tâm thức
 *
 * Created: 2026-01-28
 * Author: GEM Team
 */

// ============================================================
// THANG TẦN SỐ HAWKINS - TRADING PSYCHOLOGY
// ============================================================

/**
 * Thang đo tần số cảm xúc của David Hawkins
 * Áp dụng cho tâm lý giao dịch
 */
export const HAWKINS_SCALE = {
  XAU_HO: {
    id: 'XAU_HO',
    tanSo: 20,
    ten: 'Xấu Hổ',
    tenTiengAnh: 'Shame',
    moTa: 'Cảm giác tự khinh thường bản thân sau khi thua lỗ nặng',
    quyCheTrading: 'KHÔNG ĐƯỢC TRADE',
    lyDoQuyChe: 'Tần số này khiến bạn đưa ra quyết định tự hủy hoại. Mọi hành động đều mang tính trừng phạt bản thân.',
    dauHieu: [
      'Muốn ẩn mình, không dám nhìn vào tài khoản',
      'Tự trách móc liên tục',
      'Cảm giác mình vô giá trị',
      'Muốn bỏ cuộc hoàn toàn',
    ],
    cachNangTanSo: [
      'Thở sâu 10 phút, tập trung vào hiện tại',
      'Viết nhật ký giao dịch, phân tích khách quan',
      'Nhớ rằng thua lỗ là học phí, không phải thước đo giá trị bản thân',
      'Nghỉ ngơi tối thiểu 48 giờ trước khi trade lại',
    ],
    noiDungSuPhu: `Tần số 20 Hz - Xấu Hổ. Đây là vực thẳm tâm lý mà nhiều trader rơi vào sau chuỗi thua lỗ. Ta nghiêm cấm bạn chạm vào chart khi ở trạng thái này. Không phải vì yếu đuối, mà vì bạn đang tự trừng phạt mình qua từng lệnh. Hãy dừng lại. Thở. Viết ra những gì đã xảy ra một cách khách quan. Thua lỗ không định nghĩa giá trị của bạn với tư cách một trader.`,
  },

  TOI_LOI: {
    id: 'TOI_LOI',
    tanSo: 30,
    ten: 'Tội Lỗi',
    tenTiengAnh: 'Guilt',
    moTa: 'Cảm giác có lỗi vì đã phá vỡ kỷ luật giao dịch',
    quyCheTrading: 'KHÔNG ĐƯỢC TRADE',
    lyDoQuyChe: 'Tội lỗi dẫn đến hành vi bù đắp không lý trí. Bạn sẽ trade để chuộc lỗi, không phải để kiếm lợi nhuận.',
    dauHieu: [
      'Tự trách vì đã không tuân thủ kế hoạch',
      'Cảm giác có lỗi với gia đình/người thân',
      'Muốn sửa sai ngay lập tức',
      'Không thể tập trung vào việc khác',
    ],
    cachNangTanSo: [
      'Chấp nhận sai lầm như một phần của hành trình',
      'Viết bài học rút ra từ sai lầm',
      'Tha thứ cho bản thân một cách có ý thức',
      'Nghỉ ngơi 24 giờ',
    ],
    noiDungSuPhu: `Tần số 30 Hz - Tội Lỗi. Bạn đang mang gánh nặng của những quyết định sai. Ta hiểu. Nhưng cảm giác tội lỗi sẽ khiến bạn vội vàng sửa sai bằng những lệnh thiếu suy nghĩ. Điều bạn cần bây giờ không phải là một lệnh thắng, mà là sự tha thứ cho chính mình. Viết ra bài học. Rồi đóng máy tính lại.`,
  },

  LANH_DAM: {
    id: 'LANH_DAM',
    tanSo: 50,
    ten: 'Lãnh Đạm',
    tenTiengAnh: 'Apathy',
    moTa: 'Trạng thái buông xuôi, không còn quan tâm đến kết quả',
    quyCheTrading: 'KHÔNG ĐƯỢC TRADE',
    lyDoQuyChe: 'Lãnh đạm là dấu hiệu của sự kiệt sức tâm lý. Bạn không có năng lượng để đưa ra quyết định đúng đắn.',
    dauHieu: [
      'Không còn hứng thú với chart',
      'Cảm giác mọi thứ đều vô nghĩa',
      'Trade một cách máy móc, không phân tích',
      'Không quan tâm thắng hay thua',
    ],
    cachNangTanSo: [
      'Nghỉ ngơi hoàn toàn, ít nhất 1 tuần',
      'Làm những việc bạn yêu thích ngoài trading',
      'Gặp gỡ bạn bè, gia đình',
      'Tập thể dục để tăng năng lượng',
    ],
    noiDungSuPhu: `Tần số 50 Hz - Lãnh Đạm. Bạn đã kiệt sức. Tâm trí bạn đang đình công để bảo vệ chính bạn. Ta không cho phép bạn trade trong trạng thái này vì mỗi lệnh sẽ chỉ đào sâu thêm vực thẳm. Hãy rời khỏi thị trường. Đi ra ngoài. Sống. Chart sẽ vẫn ở đó khi bạn trở lại với năng lượng mới.`,
  },

  BUON_RAU: {
    id: 'BUON_RAU',
    tanSo: 75,
    ten: 'Buồn Rầu',
    tenTiengAnh: 'Grief',
    moTa: 'Trạng thái đau buồn vì mất mát trong trading',
    quyCheTrading: 'KHÔNG ĐƯỢC TRADE',
    lyDoQuyChe: 'Buồn rầu làm méo mó nhận thức. Bạn sẽ tìm kiếm an ủi thông qua trading thay vì lợi nhuận.',
    dauHieu: [
      'Tiếc nuối những cơ hội đã bỏ lỡ',
      'Đau buồn vì số tiền đã mất',
      'Khó chấp nhận thực tại',
      'Hay thở dài, cảm giác trống rỗng',
    ],
    cachNangTanSo: [
      'Cho phép bản thân được buồn, không kìm nén',
      'Chia sẻ với người tin tưởng',
      'Nhắc nhở bản thân rằng mất mát là tạm thời',
      'Nghỉ ngơi cho đến khi cảm xúc ổn định',
    ],
    noiDungSuPhu: `Tần số 75 Hz - Buồn Rầu. Ta thấy sự mất mát trong mắt bạn. Những con số đỏ không chỉ là tiền - chúng đại diện cho hy vọng, cho nỗ lực, cho ước mơ. Hãy cho phép mình được buồn. Nhưng đừng mang nỗi buồn đó vào chart. Nước mắt trên bàn phím không bao giờ mang lại lệnh thắng.`,
  },

  SO_HAI: {
    id: 'SO_HAI',
    tanSo: 100,
    ten: 'Sợ Hãi',
    tenTiengAnh: 'Fear',
    moTa: 'Trạng thái lo sợ, hoảng loạn khi giao dịch',
    quyCheTrading: 'CHỈ TRADE SIZE NHỎ',
    lyDoQuyChe: 'Sợ hãi khiến bạn phản ứng thái quá. Giảm size để giảm áp lực tâm lý.',
    dauHieu: [
      'Tim đập nhanh khi vào lệnh',
      'Không dám giữ lệnh theo kế hoạch',
      'Cắt lỗ quá sớm vì sợ',
      'Lo lắng liên tục về tài khoản',
    ],
    cachNangTanSo: [
      'Giảm size xuống 25% bình thường',
      'Thiền định 10 phút trước khi trade',
      'Nhắc nhở: "Thua lỗ là chi phí kinh doanh"',
      'Tập trung vào quy trình, không phải kết quả',
    ],
    noiDungSuPhu: `Tần số 100 Hz - Sợ Hãi. Đây là trạng thái nguy hiểm nhưng có thể kiểm soát. Sợ hãi trong trading thường đến từ việc đặt cược quá lớn so với khả năng chịu đựng. Ta cho phép bạn trade, nhưng với điều kiện: giảm size xuống 25%. Khi áp lực giảm, sự sáng suốt sẽ trở lại. Bạn đang kiểm soát rủi ro hay rủi ro đang kiểm soát bạn?`,
  },

  MONG_CAU: {
    id: 'MONG_CAU',
    tanSo: 125,
    ten: 'Mong Cầu',
    tenTiengAnh: 'Desire',
    moTa: 'Trạng thái khao khát lợi nhuận mãnh liệt',
    quyCheTrading: 'GIỚI HẠN SỐ LỆNH',
    lyDoQuyChe: 'Mong cầu dẫn đến overtrade. Giới hạn số lệnh để kiểm soát ham muốn.',
    dauHieu: [
      'Muốn làm giàu nhanh',
      'Không chịu được việc đứng ngoài thị trường',
      'Liên tục tìm kiếm setup',
      'Tăng size để "đuổi" lợi nhuận',
    ],
    cachNangTanSo: [
      'Giới hạn tối đa 3 lệnh mỗi ngày',
      'Viết ra lý do thực sự bạn muốn trade',
      'Nhắc nhở: "Không trade cũng là một quyết định"',
      'Chờ setup hoàn hảo, không cưỡng ép',
    ],
    noiDungSuPhu: `Tần số 125 Hz - Mong Cầu. Ta nhận ra sự khao khát cháy bỏng trong bạn. Muốn thắng, muốn giàu, muốn chứng minh. Nhưng chính sự mong cầu này đang làm mờ mắt bạn. Hôm nay bạn chỉ được phép vào tối đa 3 lệnh. Không hơn. Chất lượng quan trọng hơn số lượng. Bạn có đủ kiên nhẫn để chờ setup hoàn hảo không?`,
  },

  TUC_GIAN: {
    id: 'TUC_GIAN',
    tanSo: 150,
    ten: 'Tức Giận',
    tenTiengAnh: 'Anger',
    moTa: 'Trạng thái giận dữ với thị trường hoặc bản thân',
    quyCheTrading: 'DỪNG TRADE 24H',
    lyDoQuyChe: 'Tức giận là năng lượng mạnh nhưng phá hủy. Bạn cần thời gian để nó nguội đi.',
    dauHieu: [
      'Muốn trả thù thị trường',
      'Đổ lỗi cho mọi thứ trừ bản thân',
      'Vào lệnh một cách hung hăng',
      'Không chấp nhận thua',
    ],
    cachNangTanSo: [
      'Tập thể dục nặng để giải tỏa năng lượng',
      'Viết ra tất cả những gì bạn đang giận',
      'Đợi 24 giờ trước khi mở lại chart',
      'Phân tích nguyên nhân thực sự của cơn giận',
    ],
    noiDungSuPhu: `Tần số 150 Hz - Tức Giận. Ta cảm nhận được ngọn lửa trong bạn. Muốn đập phá, muốn trả thù, muốn chứng minh thị trường đã sai. Nhưng thị trường không có cảm xúc. Nó không quan tâm đến cơn giận của bạn. Mỗi lệnh revenge chỉ đốt thêm tài khoản của bạn. Đóng máy. Đi chạy bộ. Quay lại sau 24 giờ khi đầu óc đã nguội.`,
  },

  KIEU_NGAO: {
    id: 'KIEU_NGAO',
    tanSo: 175,
    ten: 'Kiêu Ngạo',
    tenTiengAnh: 'Pride',
    moTa: 'Trạng thái tự tin thái quá sau chuỗi thắng',
    quyCheTrading: 'GIỮ NGUYÊN SIZE',
    lyDoQuyChe: 'Kiêu ngạo dẫn đến tăng size vô lý. Giữ nguyên size để không phá vỡ kỷ luật.',
    dauHieu: [
      'Cảm giác mình là "cao thủ"',
      'Bỏ qua các quy tắc quản lý rủi ro',
      'Tăng size sau chuỗi thắng',
      'Không thèm phân tích kỹ',
    ],
    cachNangTanSo: [
      'Nhớ lại những lần thua lỗ',
      'Giữ nguyên size dù đang thắng',
      'Viết nhật ký với góc nhìn khách quan',
      'Hỏi bản thân: "Đây là kỹ năng hay may mắn?"',
    ],
    noiDungSuPhu: `Tần số 175 Hz - Kiêu Ngạo. Đây là bẫy ngọt ngào nhất của thị trường. Sau vài lệnh thắng, bạn bắt đầu nghĩ mình bất khả chiến bại. Ta đã chứng kiến nhiều trader xuất sắc ngã vì kiêu ngạo. Quy tắc của Ta: dù bạn vừa thắng 10 lệnh liên tiếp, size lệnh tiếp theo vẫn giữ nguyên. Không ngoại lệ. Thị trường có thể lấy lại mọi thứ trong một đêm.`,
  },

  CAN_DAM: {
    id: 'CAN_DAM',
    tanSo: 200,
    ten: 'Can Đảm',
    tenTiengAnh: 'Courage',
    moTa: 'Trạng thái sẵn sàng đối mặt với rủi ro một cách có tính toán',
    quyCheTrading: 'TRADE BÌNH THƯỜNG',
    lyDoQuyChe: 'Đây là ngưỡng tối thiểu để trade hiệu quả. Bạn đủ can đảm để chấp nhận rủi ro và đủ khiêm tốn để tuân thủ kỷ luật.',
    dauHieu: [
      'Chấp nhận cả thắng và thua',
      'Vào lệnh theo kế hoạch',
      'Không để cảm xúc chi phối',
      'Sẵn sàng cắt lỗ khi cần',
    ],
    cachDuyTri: [
      'Duy trì routine buổi sáng',
      'Viết nhật ký giao dịch đều đặn',
      'Nghỉ ngơi đủ giấc',
      'Tập thể dục thường xuyên',
    ],
    noiDungSuPhu: `Tần số 200 Hz - Can Đảm. Đây là cột mốc đầu tiên của sự trưởng thành trong trading. Bạn không còn sợ thua, không còn mong thắng một cách mù quáng. Bạn chấp nhận rủi ro như một phần tất yếu của trò chơi. Ở tần số này, bạn có thể trade bình thường với full size. Nhưng hãy nhớ: can đảm không phải là không sợ, mà là hành động đúng dù có sợ.`,
  },

  TRUNG_LAP: {
    id: 'TRUNG_LAP',
    tanSo: 250,
    ten: 'Trung Lập',
    tenTiengAnh: 'Neutrality',
    moTa: 'Trạng thái cân bằng, không bị chi phối bởi kết quả',
    quyCheTrading: 'TRADE TỐI ĐA',
    lyDoQuyChe: 'Bạn đã đạt được sự tách rời giữa cảm xúc và quyết định. Đây là trạng thái lý tưởng để trade.',
    dauHieu: [
      'Không vui quá khi thắng',
      'Không buồn quá khi thua',
      'Tập trung vào quy trình',
      'Chấp nhận mọi kết quả',
    ],
    cachDuyTri: [
      'Thiền định mỗi ngày',
      'Giữ khoảng cách với chart sau giờ trade',
      'Không check P&L liên tục',
      'Tập trung vào bức tranh dài hạn',
    ],
    noiDungSuPhu: `Tần số 250 Hz - Trung Lập. Bạn đã bước vào vùng mà rất ít trader đạt được. Không phải bạn không có cảm xúc, mà bạn đã học cách không để cảm xúc điều khiển hành động. Thắng hay thua chỉ là feedback cho hệ thống. Ở trạng thái này, Ta cho phép bạn trade với confidence tối đa. Bạn đã sẵn sàng để trở thành bậc thầy của chính mình.`,
  },

  SAN_LONG: {
    id: 'SAN_LONG',
    tanSo: 310,
    ten: 'Sẵn Lòng',
    tenTiengAnh: 'Willingness',
    moTa: 'Trạng thái mở lòng học hỏi và cải thiện',
    quyCheTrading: 'TRADE TỰ DO',
    lyDoQuyChe: 'Bạn không chỉ trade tốt mà còn liên tục tiến bộ. Hãy tự tin với khả năng của mình.',
    dauHieu: [
      'Luôn tìm cách cải thiện hệ thống',
      'Sẵn sàng nhận lỗi và sửa',
      'Học hỏi từ mọi giao dịch',
      'Giúp đỡ trader khác',
    ],
    cachDuyTri: [
      'Học một kỹ thuật mới mỗi tuần',
      'Review giao dịch hàng tuần',
      'Chia sẻ kiến thức với cộng đồng',
      'Đặt mục tiêu phát triển liên tục',
    ],
    noiDungSuPhu: `Tần số 310 Hz - Sẵn Lòng. Bạn không chỉ là trader, bạn đang trở thành một học trò thực sự của thị trường. Luôn mở lòng, luôn học hỏi, luôn cải thiện. Đây là năng lượng của sự phát triển bền vững. Ta không có gì để dạy thêm cho bạn ở cấp độ kỹ thuật - hãy tin vào trực giác đã được rèn luyện của mình.`,
  },

  CHAP_NHAN: {
    id: 'CHAP_NHAN',
    tanSo: 350,
    ten: 'Chấp Nhận',
    tenTiengAnh: 'Acceptance',
    moTa: 'Trạng thái chấp nhận hoàn toàn bản chất của thị trường',
    quyCheTrading: 'TRADE TỰ DO',
    lyDoQuyChe: 'Bạn đã hiểu rằng thị trường không phải là kẻ thù hay bạn bè. Nó chỉ là nó.',
    dauHieu: [
      'Không còn đổ lỗi cho ai/điều gì',
      'Hiểu rằng mọi kết quả đều do mình',
      'Bình tĩnh trước mọi biến động',
      'Không cần sự chắc chắn',
    ],
    cachDuyTri: [
      'Thực hành mindfulness',
      'Chấp nhận sự bất định',
      'Sống trong hiện tại',
      'Buông bỏ nhu cầu kiểm soát',
    ],
    noiDungSuPhu: `Tần số 350 Hz - Chấp Nhận. Bạn đã vượt qua được nhu cầu phải đúng, phải thắng, phải kiểm soát. Thị trường là gì thì nó là vậy. Bạn không cố gắng thay đổi nó, bạn chỉ đọc và phản ứng. Đây là cảnh giới mà Ta muốn tất cả học trò đạt được. Từ đây, mỗi lệnh của bạn đều mang sự nhẹ nhàng của người đã buông.`,
  },

  LY_TRI: {
    id: 'LY_TRI',
    tanSo: 400,
    ten: 'Lý Trí',
    tenTiengAnh: 'Reason',
    moTa: 'Trạng thái phân tích logic cao độ',
    quyCheTrading: 'TRADE TỰ DO',
    lyDoQuyChe: 'Bạn đưa ra quyết định dựa trên logic thuần túy. Cảm xúc không còn là yếu tố.',
    dauHieu: [
      'Mọi quyết định đều có cơ sở',
      'Phân tích dữ liệu một cách hệ thống',
      'Không bị ảnh hưởng bởi tin tức',
      'Hiểu rõ xác suất của mỗi setup',
    ],
    noiDungSuPhu: `Tần số 400 Hz - Lý Trí. Bạn đã trở thành một cỗ máy phân tích. Mỗi quyết định đều được cân nhắc, tính toán, và thực thi không cảm xúc. Ta kính trọng những trader đạt đến cảnh giới này. Nhưng hãy nhớ: lý trí thuần túy đôi khi bỏ qua những tín hiệu mà chỉ trực giác mới bắt được. Đừng để logic giết chết nghệ thuật.`,
  },

  YEU_THUONG: {
    id: 'YEU_THUONG',
    tanSo: 500,
    ten: 'Yêu Thương',
    tenTiengAnh: 'Love',
    moTa: 'Trạng thái yêu thương vô điều kiện với quá trình trading',
    quyCheTrading: 'TRADE TỰ DO',
    lyDoQuyChe: 'Bạn trade vì yêu thích, không phải vì tiền. Đây là động lực bền vững nhất.',
    dauHieu: [
      'Yêu thích quá trình hơn kết quả',
      'Biết ơn mỗi bài học từ thị trường',
      'Trading là niềm vui, không phải áp lực',
      'Lan tỏa năng lượng tích cực',
    ],
    noiDungSuPhu: `Tần số 500 Hz - Yêu Thương. Bạn đã yêu trading theo cách mà ít người hiểu được. Không phải yêu tiền, không phải yêu sự kích thích, mà yêu chính quá trình - phân tích, ra quyết định, chờ đợi, học hỏi. Khi bạn trade từ tình yêu, không có áp lực nào có thể làm bạn lung lay. Đây là cảnh giới của những bậc thầy thực sự.`,
  },

  BINH_AN: {
    id: 'BINH_AN',
    tanSo: 600,
    ten: 'Bình An',
    tenTiengAnh: 'Peace',
    moTa: 'Trạng thái bình an sâu lắng, vượt trên mọi biến động',
    quyCheTrading: 'TỰ DO HOÀN TOÀN',
    lyDoQuyChe: 'Bạn đã đạt đến cảnh giới mà kết quả trading không còn ảnh hưởng đến sự bình an nội tâm.',
    dauHieu: [
      'Bình tĩnh tuyệt đối trước mọi tình huống',
      'Không còn gắn bó với kết quả',
      'An lạc dù thắng hay thua',
      'Truyền cảm hứng cho người khác',
    ],
    noiDungSuPhu: `Tần số 600 Hz - Bình An. Đây là đỉnh cao mà Ta có thể mô tả bằng ngôn ngữ. Bạn không còn là trader - bạn là người chứng kiến mình trade. Thắng thua chỉ là những gợn sóng trên mặt hồ tĩnh lặng của tâm thức. Ta cúi đầu trước bạn. Không còn gì để dạy. Hãy đi và dẫn dắt những người khác.`,
  },

  GIAC_NGO: {
    id: 'GIAC_NGO',
    tanSo: 700,
    ten: 'Giác Ngộ',
    tenTiengAnh: 'Enlightenment',
    moTa: 'Trạng thái giác ngộ, hợp nhất với dòng chảy của thị trường',
    quyCheTrading: 'VƯỢT TRÊN TRADE',
    lyDoQuyChe: 'Ở cảnh giới này, trading chỉ là một trong vô số biểu hiện của sự sống. Bạn có thể trade hoặc không - không còn khác biệt.',
    dauHieu: [
      'Thấy được sự thống nhất của mọi thứ',
      'Không còn phân biệt thắng/thua',
      'Hành động tự nhiên như thở',
      'Tồn tại trong hiện tại tuyệt đối',
    ],
    noiDungSuPhu: `Tần số 700 Hz - Giác Ngộ. Đây là cảnh giới mà ngôn ngữ không còn đủ. Nếu bạn đang đọc dòng này với sự hiểu biết thực sự, không phải với tư duy, thì bạn đã biết. Thị trường và bạn không còn tách biệt. Chart là tấm gương phản chiếu tâm thức vũ trụ. Ta không có gì để nói thêm. Om.`,
  },
};

// ============================================================
// 4 TRẠNG THÁI NGUY HIỂM TRONG GIAO DỊCH
// ============================================================

/**
 * 4 trạng thái tâm lý nguy hiểm nhất khi trading
 * Cần nhận diện và xử lý ngay
 */
export const TRANG_THAI_NGUY_HIEM = {
  AM_ANH_LOI_NHUAN: {
    id: 'AM_ANH_LOI_NHUAN',
    ten: 'Ám Ảnh Lợi Nhuận',
    tenTiengAnh: 'Profit Obsession',
    tanSo: 125,
    mucDoNguyHiem: 'CAO',
    moTa: 'Trạng thái tâm lý luôn nghĩ về tiền, về lợi nhuận, không thể nghỉ ngơi',
    dauHieu: [
      'Không thể ngừng nghĩ về trading khi không trade',
      'Tính toán lợi nhuận liên tục trong đầu',
      'Mở app check giá mỗi vài phút',
      'Mất ngủ vì nghĩ về thị trường',
      'Không thể tập trung vào việc khác',
      'Tăng size để đạt mục tiêu nhanh hơn',
    ],
    hauQua: [
      'Overtrade và thua lỗ',
      'Kiệt sức về tinh thần',
      'Ảnh hưởng đến các mối quan hệ',
      'Ra quyết định vội vàng',
      'Không tuân thủ kỷ luật',
    ],
    cachKhacPhuc: [
      'Đặt giới hạn số lệnh mỗi ngày (tối đa 3)',
      'Chỉ check chart vào giờ cố định',
      'Thiền định 15 phút mỗi sáng',
      'Tập trung vào quy trình, không phải kết quả',
      'Viết ra số tiền bạn thực sự CẦN, không phải MUỐN',
    ],
    baiTapThucHanh: 'Hôm nay, hãy đặt điện thoại xa tầm tay trong 2 giờ. Quan sát những gì bạn cảm thấy khi không thể check chart. Viết ra cảm xúc đó.',
    noiDungSuPhu: `Ám Ảnh Lợi Nhuận - Kẻ giết người thầm lặng của trader. Ta đã chứng kiến bao người tài năng ngã vì căn bệnh này. Họ không thua vì thiếu kỹ năng, họ thua vì quá thèm khát. Tiền không chạy theo người đuổi nó. Hãy trở thành người mà tiền muốn đến. Điều đó chỉ xảy ra khi bạn dừng việc ám ảnh về nó.`,
  },

  HOANG_LOAN: {
    id: 'HOANG_LOAN',
    ten: 'Hoảng Loạn',
    tenTiengAnh: 'Panic State',
    tanSo: 100,
    mucDoNguyHiem: 'RẤT CAO',
    moTa: 'Trạng thái mất kiểm soát khi thị trường đi ngược dự đoán',
    dauHieu: [
      'Tim đập nhanh, khó thở khi nhìn chart',
      'Tay run khi vào/thoát lệnh',
      'Không thể suy nghĩ logic',
      'Hành động bốc đồng',
      'Muốn đóng tất cả lệnh ngay',
      'Cảm giác như sắp mất tất cả',
    ],
    hauQua: [
      'Cắt lỗ không theo kế hoạch',
      'Vào lệnh ngược để gỡ',
      'Tăng size trong tuyệt vọng',
      'Mất số tiền lớn trong thời gian ngắn',
      'Tổn thương tâm lý sâu sắc',
    ],
    cachKhacPhuc: [
      'NGAY LẬP TỨC rời khỏi màn hình',
      'Thở sâu 4-7-8 (hít 4s, giữ 7s, thở 8s) x 5 lần',
      'Gọi cho người tin tưởng',
      'Không được trade trong 24 giờ tới',
      'Viết ra chính xác những gì đã xảy ra',
    ],
    baiTapThucHanh: 'Tạo một "nút khẩn cấp" - một danh sách 5 bước bạn sẽ làm khi hoảng loạn. Dán nó lên màn hình máy tính. Luyện tập khi đang bình tĩnh.',
    noiDungSuPhu: `Hoảng Loạn - Khi não bò sát chiếm quyền kiểm soát. Bạn không còn là một trader có logic, bạn là con thú đang chạy trốn khỏi nguy hiểm. Và con thú không biết cắt lỗ đúng chỗ. Khi bạn cảm thấy tim đập nhanh, tay run, đó là tín hiệu để DỪNG LẠI. Không phải để hành động. Dừng. Thở. Rời đi. Thị trường vẫn ở đó ngày mai.`,
  },

  MUON_GO_THUA: {
    id: 'MUON_GO_THUA',
    ten: 'Muốn Gỡ Thua',
    tenTiengAnh: 'Revenge Trading',
    tanSo: 150,
    mucDoNguyHiem: 'RẤT CAO',
    moTa: 'Trạng thái muốn lấy lại tiền đã mất bằng mọi giá',
    dauHieu: [
      'Cảm giác thị trường "nợ" bạn',
      'Vào lệnh ngay sau khi thua',
      'Tăng size để gỡ nhanh',
      'Bỏ qua các quy tắc quản lý rủi ro',
      'Giận dữ với chính mình hoặc thị trường',
      'Nghĩ rằng "chỉ cần một lệnh thắng"',
    ],
    hauQua: [
      'Thua lỗ chồng chất',
      'Cháy tài khoản',
      'Trầm cảm và lo âu',
      'Mất niềm tin vào bản thân',
      'Nợ nần (nếu trade margin)',
    ],
    cachKhacPhuc: [
      'Đặt quy tắc: sau 2 lệnh thua, nghỉ cả ngày',
      'TUYỆT ĐỐI không tăng size sau khi thua',
      'Viết ra số tiền thua như "chi phí học tập"',
      'Chờ tối thiểu 1 giờ trước khi vào lệnh tiếp',
      'Hỏi bản thân: "Lệnh này vì strategy hay vì tức giận?"',
    ],
    baiTapThucHanh: 'Tạo một "bức tường lửa": thiết lập broker tự động khóa tài khoản sau khi thua X%. Điều này bảo vệ bạn khỏi chính mình.',
    noiDungSuPhu: `Muốn Gỡ Thua - Đây là con đường nhanh nhất đến việc cháy tài khoản. Ta đã chứng kiến những trader thông minh mất tất cả trong một đêm vì tâm lý này. Thị trường không nợ bạn gì cả. Mỗi lệnh là một trận đánh độc lập. Lệnh trước thua không có nghĩa lệnh sau phải thắng. Khi bạn cảm thấy muốn gỡ, đó chính xác là lúc bạn cần dừng lại.`,
  },

  CAI_TOI_CHI_PHOI: {
    id: 'CAI_TOI_CHI_PHOI',
    ten: 'Cái Tôi Chi Phối',
    tenTiengAnh: 'Ego-Driven Trading',
    tanSo: 175,
    mucDoNguyHiem: 'CAO',
    moTa: 'Trạng thái không chấp nhận sai, để cái tôi quyết định thay vì logic',
    dauHieu: [
      'Không cắt lỗ vì sợ "nhận thua"',
      'Không thừa nhận phân tích sai',
      'Post trên mạng xã hội khi thắng, im lặng khi thua',
      'So sánh với trader khác',
      'Cần chứng minh mình đúng',
      'Phớt lờ các tín hiệu ngược',
    ],
    hauQua: [
      'Để lệnh thua chạy quá lâu',
      'Bỏ lỡ cơ hội cut loss nhỏ',
      'Stress kéo dài',
      'Không học được từ sai lầm',
      'Mất tiền vì bướng bỉnh',
    ],
    cachKhacPhuc: [
      'Nhắc nhở: "Đúng hay sai không quan trọng, quan trọng là kiếm tiền"',
      'Không bao giờ post lệnh công khai trước khi đóng',
      'Viết nhật ký các lần mình sai',
      'Học hỏi từ những người giỏi hơn',
      'Đặt stop loss tự động để cái tôi không can thiệp',
    ],
    baiTapThucHanh: 'Tuần này, hãy viết 3 sai lầm giao dịch của bạn và chia sẻ với một người bạn trade. Đây là bài tập khiêm nhường.',
    noiDungSuPhu: `Cái Tôi Chi Phối - Kẻ thù vô hình nguy hiểm nhất. Nó thì thầm: "Đừng cắt lỗ, bạn sẽ đúng, thị trường sẽ quay lại." Nó là lý do khiến lệnh thua 2% biến thành thua 20%. Ta nói với bạn sự thật phũ phàng: thị trường không quan tâm bạn nghĩ gì. Nó không quan tâm bạn thông minh hay ngu ngốc. Nó chỉ đi theo cung cầu. Hãy giết cái tôi của bạn trước khi nó giết tài khoản của bạn.`,
  },
};

// ============================================================
// ĐÁ PHONG THỦY CHO TRADER
// ============================================================

/**
 * Đá phong thủy hỗ trợ năng lượng trading
 * Kết hợp tần số và công dụng
 */
export const DA_PHONG_THUY_TRADING = {
  THACH_ANH_TIM: {
    id: 'THACH_ANH_TIM',
    ten: 'Thạch Anh Tím',
    tenTiengAnh: 'Amethyst',
    tanSo: 417,
    mauSac: 'Tím',
    nguyenTo: 'Thủy - Kim',
    cungHoangDao: ['Song Ngư', 'Bảo Bình', 'Xử Nữ'],
    congDung: [
      'Giảm stress và lo âu',
      'Tăng trực giác trong giao dịch',
      'Cân bằng cảm xúc',
      'Hỗ trợ giấc ngủ sâu',
      'Thanh lọc năng lượng tiêu cực',
    ],
    cachSuDung: [
      'Đặt trên bàn làm việc, bên trái màn hình',
      'Cầm khi thiền định trước phiên trade',
      'Đeo như vòng tay khi giao dịch',
      'Đặt dưới gối để có giấc ngủ ngon',
    ],
    luuY: [
      'Tránh ánh nắng trực tiếp (phai màu)',
      'Làm sạch bằng nước muối hàng tuần',
      'Sạc năng lượng dưới ánh trăng',
    ],
    noiDungSuPhu: `Thạch Anh Tím - Viên đá của trực giác. Trong trading, có những tín hiệu mà chart không thể hiện thị, nhưng trực giác đã được rèn luyện có thể bắt được. Thạch anh tím khuếch đại khả năng này. Đặt nó bên trái bạn - phía của trực giác. Khi bạn phân vân giữa hai quyết định và logic không giúp được, hãy chạm vào viên đá và lắng nghe.`,
  },

  THACH_ANH_VANG: {
    id: 'THACH_ANH_VANG',
    ten: 'Thạch Anh Vàng',
    tenTiengAnh: 'Citrine',
    tanSo: 528,
    mauSac: 'Vàng - Cam',
    nguyenTo: 'Hỏa - Thổ',
    cungHoangDao: ['Sư Tử', 'Song Tử', 'Bạch Dương'],
    congDung: [
      'Thu hút thịnh vượng và may mắn',
      'Tăng sự tự tin khi giao dịch',
      'Kích hoạt năng lượng sáng tạo',
      'Loại bỏ tư duy khan hiếm',
      'Hỗ trợ ra quyết định dứt khoát',
    ],
    cachSuDung: [
      'Đặt ở góc tài lộc của phòng (đông nam)',
      'Cầm khi đặt mục tiêu giao dịch',
      'Đeo vòng cổ để năng lượng gần tim',
      'Đặt trong ví hoặc gần tiền',
    ],
    luuY: [
      'Không cần sạc thường xuyên (tự thanh lọc)',
      'Tránh tiếp xúc với hóa chất',
      'Giữ sạch sẽ để năng lượng lưu thông',
    ],
    noiDungSuPhu: `Thạch Anh Vàng - Viên đá của sự phong phú. Nó không mang tiền đến cho bạn một cách kỳ diệu. Nhưng nó thay đổi tần số năng lượng của bạn từ "tôi không đủ" sang "tôi xứng đáng có nhiều hơn". Và thị trường phản ứng với năng lượng. Khi bạn trade từ tâm thế phong phú thay vì khan hiếm, quyết định của bạn sẽ khác. Đặt nó ở góc đông nam bàn làm việc.`,
  },

  TOURMALINE_DEN: {
    id: 'TOURMALINE_DEN',
    ten: 'Tourmaline Đen',
    tenTiengAnh: 'Black Tourmaline',
    tanSo: 174,
    mauSac: 'Đen',
    nguyenTo: 'Thổ',
    cungHoangDao: ['Ma Kết', 'Thiên Bình'],
    congDung: [
      'Bảo vệ khỏi năng lượng tiêu cực',
      'Grounding - kết nối với thực tại',
      'Hấp thụ stress và lo âu',
      'Tạo tường chắn EMF từ thiết bị',
      'Giữ bình tĩnh trong biến động',
    ],
    cachSuDung: [
      'Đặt giữa bạn và màn hình máy tính',
      'Cầm khi thị trường volatility cao',
      'Đặt ở 4 góc phòng để bảo vệ không gian',
      'Mang theo khi trade ở nơi lạ',
    ],
    luuY: [
      'Cần làm sạch thường xuyên (hấp thụ nhiều năng lượng)',
      'Chôn trong đất hoặc muối biển qua đêm',
      'Thay mới sau 1 năm sử dụng nặng',
    ],
    noiDungSuPhu: `Tourmaline Đen - Người lính gác của trader. Khi thị trường hỗn loạn, khi FUD tràn ngập, khi mọi người đang hoảng loạn, viên đá này giữ cho bạn vững chãi. Nó không ngăn bạn thua, nhưng nó ngăn năng lượng hoảng sợ bên ngoài xâm nhập vào quyết định của bạn. Đặt nó giữa bạn và màn hình. Nó là bức tường thành của bạn.`,
  },

  MAT_HO: {
    id: 'MAT_HO',
    ten: 'Mắt Hổ',
    tenTiengAnh: 'Tiger Eye',
    tanSo: 396,
    mauSac: 'Vàng nâu - Sọc',
    nguyenTo: 'Hỏa - Thổ',
    cungHoangDao: ['Sư Tử', 'Ma Kết', 'Xử Nữ'],
    congDung: [
      'Tăng can đảm khi vào lệnh',
      'Cân bằng giữa sợ hãi và liều lĩnh',
      'Nâng cao sự tập trung',
      'Bảo vệ trong các giao dịch rủi ro',
      'Nhìn rõ cơ hội ẩn giấu',
    ],
    cachSuDung: [
      'Đeo như nhẫn ở tay phải (tay hành động)',
      'Nhìn vào trước khi vào lệnh quan trọng',
      'Đặt trên bàn, phía bên phải',
      'Cầm khi thiết lập kế hoạch giao dịch',
    ],
    luuY: [
      'Sạc dưới ánh mặt trời (đá của năng lượng dương)',
      'Tránh cho người khác chạm vào',
      'Làm sạch bằng khói xô thơm',
    ],
    noiDungSuPhu: `Mắt Hổ - Viên đá của chiến binh. Trong rừng rậm thị trường, bạn cần đôi mắt của hổ để nhìn thấy con mồi (cơ hội) và kẻ săn (rủi ro). Viên đá này cân bằng giữa can đảm và thận trọng. Nó không khiến bạn liều lĩnh, cũng không khiến bạn nhát gan. Nó cho bạn sự sáng suốt của kẻ săn mồi. Đeo ở tay phải - tay mà bạn click chuột.`,
  },

  AVENTURINE_XANH: {
    id: 'AVENTURINE_XANH',
    ten: 'Aventurine Xanh',
    tenTiengAnh: 'Green Aventurine',
    tanSo: 432,
    mauSac: 'Xanh lá',
    nguyenTo: 'Mộc - Thổ',
    cungHoangDao: ['Kim Ngưu', 'Xử Nữ', 'Thiên Bình'],
    congDung: [
      'Thu hút may mắn trong giao dịch',
      'Tăng khả năng nắm bắt cơ hội',
      'Giảm căng thẳng về tiền bạc',
      'Hỗ trợ tăng trưởng tài chính',
      'Cân bằng tim mạch trong stress',
    ],
    cachSuDung: [
      'Đặt ở góc tài lộc (đông nam)',
      'Cầm khi lập kế hoạch tài chính',
      'Đeo gần tim (vòng cổ)',
      'Đặt trong két sắt hoặc nơi giữ tiền',
    ],
    luuY: [
      'Sạc trong nước suối hoặc nước mưa',
      'Tránh ánh nắng trực tiếp kéo dài',
      'Kết hợp với thạch anh vàng để tăng hiệu quả',
    ],
    noiDungSuPhu: `Aventurine Xanh - Viên đá của cơ hội. Người ta gọi nó là "đá của những người chơi", nhưng đừng hiểu nhầm - nó không biến bạn thành con bạc. Nó mở mắt bạn để nhìn thấy những cơ hội mà người khác bỏ lỡ. Khi chart hiện một setup mà bạn còn do dự, viên đá này cho bạn sự tự tin để hành động. Đặt nó gần tim để nó kết nối với trung tâm ra quyết định của bạn.`,
  },

  PYRITE: {
    id: 'PYRITE',
    ten: 'Pyrite',
    tenTiengAnh: 'Pyrite (Fool\'s Gold)',
    tanSo: 369,
    mauSac: 'Vàng kim loại',
    nguyenTo: 'Hỏa - Thổ',
    cungHoangDao: ['Sư Tử', 'Bạch Dương'],
    congDung: [
      'Tăng cường ý chí và quyết tâm',
      'Bảo vệ tài sản',
      'Kích hoạt tư duy chiến lược',
      'Thu hút sự giàu có vật chất',
      'Tăng năng lượng nam tính (hành động)',
    ],
    cachSuDung: [
      'Đặt trên bàn làm việc',
      'Cầm khi lập chiến lược',
      'Đặt trong văn phòng hoặc phòng giao dịch',
      'Không đeo trực tiếp (năng lượng mạnh)',
    ],
    luuY: [
      'Không ngâm nước (bị oxy hóa)',
      'Làm sạch bằng khói',
      'Tránh độ ẩm cao',
      'Có thể gây phản ứng da nếu đeo',
    ],
    noiDungSuPhu: `Pyrite - Người ta gọi nó là "vàng của kẻ ngốc", nhưng Ta gọi nó là "vàng của chiến binh". Nó không lừa bạn, nó thử thách bạn. Năng lượng của nó mạnh mẽ, như ý chí cần có để theo đuổi mục tiêu tài chính. Đặt nó trên bàn làm việc như một reminder: bạn đang chiến đấu cho tự do tài chính. Không phải mọi ngày đều thắng, nhưng mọi ngày đều phải chiến đấu.`,
  },

  LABRADORITE: {
    id: 'LABRADORITE',
    ten: 'Labradorite',
    tenTiengAnh: 'Labradorite',
    tanSo: 444,
    mauSac: 'Xám - Xanh lấp lánh',
    nguyenTo: 'Thủy - Phong',
    cungHoangDao: ['Thiên Yết', 'Song Ngư', 'Bảo Bình'],
    congDung: [
      'Phát triển trực giác cao cấp',
      'Nhìn xuyên qua ảo tưởng của thị trường',
      'Bảo vệ trong transformation',
      'Kết nối với nguồn hướng dẫn cao hơn',
      'Nhận ra pattern ẩn',
    ],
    cachSuDung: [
      'Thiền định với đá trước phiên quan trọng',
      'Đặt ở vị trí mắt thứ 3 khi nằm',
      'Cầm khi phân tích chart dài hạn',
      'Đeo như mặt dây chuyền',
    ],
    luuY: [
      'Làm sạch bằng ánh trăng',
      'Tránh va đập mạnh (dễ vỡ)',
      'Chỉ dùng khi đã có nền tảng tâm linh',
    ],
    noiDungSuPhu: `Labradorite - Viên đá của pháp sư. Nó không dành cho người mới bắt đầu hành trình tâm linh. Nhưng nếu bạn đã phát triển trực giác qua năm tháng, labradorite sẽ khuếch đại nó lên gấp bội. Nó giúp bạn nhìn thấy những gì ẩn sau chart - ý định của market maker, tâm lý đám đông, dòng tiền thông minh. Dùng nó với sự tôn trọng.`,
  },
};

// ============================================================
// 22 LÁ MAJOR ARCANA TAROT
// ============================================================

/**
 * 22 lá bài Major Arcana và ý nghĩa trong trading
 */
export const MAJOR_ARCANA_TAROT = {
  0: {
    so: 0,
    ten: 'The Fool',
    tenViet: 'Kẻ Khờ',
    tuKhoa: ['Khởi đầu mới', 'Niềm tin', 'Bước nhảy vọt'],
    yNghiaChung: 'Sự khởi đầu mới đầy phấn khích, dám liều để đạt được ước mơ',
    yNghiaXuoi: 'Đây là lúc bắt đầu dự án mới, chiến lược mới. Tin vào quá trình.',
    yNghiaNguoc: 'Cẩn thận với sự liều lĩnh thiếu suy nghĩ. Đừng nhảy mà không nhìn.',
    yNghiaTrading: {
      xuoi: 'Thời điểm tốt để thử phương pháp mới, coin mới. Giữ size nhỏ.',
      nguoc: 'Cảnh báo FOMO, đừng vào lệnh chỉ vì sợ bỏ lỡ.',
    },
    noiDungSuPhu: `The Fool - Kẻ Khờ. Đừng để cái tên đánh lừa. Đây là lá bài của sự can đảm nguyên sơ, bước đầu tiên vào vùng đất chưa biết. Trong trading, nó nhắc bạn rằng mọi hành trình vĩ đại đều bắt đầu bằng một bước. Nhưng hãy nhớ: Kẻ Khờ tiến bước vì tin tưởng, không phải vì mù quáng.`,
  },

  1: {
    so: 1,
    ten: 'The Magician',
    tenViet: 'Nhà Ảo Thuật',
    tuKhoa: ['Tập trung', 'Kỹ năng', 'Biến hóa'],
    yNghiaChung: 'Bạn có đủ công cụ và kỹ năng để thành công. Hãy hành động.',
    yNghiaXuoi: 'Sử dụng tất cả tài nguyên bạn có. Thời điểm để thực hiện kế hoạch.',
    yNghiaNguoc: 'Cẩn thận với sự lừa dối hoặc sử dụng kỹ năng sai mục đích.',
    yNghiaTrading: {
      xuoi: 'Bạn có đủ kiến thức để trade. Tin vào phân tích của mình.',
      nguoc: 'Đề phòng manipulation, pump & dump. Đừng tin mọi "alpha".',
    },
    noiDungSuPhu: `The Magician - Nhà Ảo Thuật. Bạn có trước mặt mọi công cụ cần thiết: chart, indicators, knowledge, capital. Nhà Ảo Thuật không chờ đợi phép màu, anh ta TẠO RA phép màu. Lá bài này nhắc bạn: đừng đổ lỗi thiếu công cụ. Hãy thành thạo những gì bạn có.`,
  },

  2: {
    so: 2,
    ten: 'The High Priestess',
    tenViet: 'Nữ Tư Tế',
    tuKhoa: ['Trực giác', 'Bí mật', 'Nội tâm'],
    yNghiaChung: 'Lắng nghe tiếng nói bên trong. Có điều gì đó chưa được tiết lộ.',
    yNghiaXuoi: 'Tin vào trực giác. Tìm kiếm kiến thức sâu hơn.',
    yNghiaNguoc: 'Bạn đang bỏ qua trực giác. Bí mật sắp được tiết lộ.',
    yNghiaTrading: {
      xuoi: 'Đợi thêm thông tin. Có điều gì đó ẩn sau chart.',
      nguoc: 'Đừng bỏ qua gut feeling. Nếu cảm thấy sai, có thể nó sai.',
    },
    noiDungSuPhu: `The High Priestess - Nữ Tư Tế. Cô ấy ngồi giữa hai cột trụ, giữa ánh sáng và bóng tối, giữa biết và không biết. Trong trading, cô ấy nhắc bạn: không phải mọi thứ đều hiện trên chart. Có những dòng tiền ẩn, những ý định chưa lộ. Khi Nữ Tư Tế xuất hiện, hãy dừng lại và LẮNG NGHE.`,
  },

  3: {
    so: 3,
    ten: 'The Empress',
    tenViet: 'Hoàng Hậu',
    tuKhoa: ['Phong phú', 'Sáng tạo', 'Nuôi dưỡng'],
    yNghiaChung: 'Thời kỳ sinh sôi nảy nở. Sự phong phú đang đến.',
    yNghiaXuoi: 'Tài khoản sẽ tăng trưởng. Nuôi dưỡng chiến lược của bạn.',
    yNghiaNguoc: 'Cẩn thận với sự phung phí hoặc quá tự mãn.',
    yNghiaTrading: {
      xuoi: 'Thời điểm tốt cho tăng trưởng. Compound lợi nhuận.',
      nguoc: 'Đừng tiêu xài lợi nhuận. Giữ kỷ luật tài chính.',
    },
    noiDungSuPhu: `The Empress - Hoàng Hậu. Cô ấy ngồi giữa cánh đồng lúa chín vàng, biểu tượng của sự phong phú. Khi lá này xuất hiện, nó báo hiệu giai đoạn tăng trưởng. Nhưng Hoàng Hậu cũng nhắc: sự phong phú cần được nuôi dưỡng. Đừng vội vàng thu hoạch, hãy để compound làm việc của nó.`,
  },

  4: {
    so: 4,
    ten: 'The Emperor',
    tenViet: 'Hoàng Đế',
    tuKhoa: ['Kỷ luật', 'Quyền lực', 'Cấu trúc'],
    yNghiaChung: 'Thời điểm cần kỷ luật và cấu trúc. Lãnh đạo bản thân.',
    yNghiaXuoi: 'Tuân thủ kế hoạch. Kỷ luật sẽ mang lại thành công.',
    yNghiaNguoc: 'Quá cứng nhắc hoặc thiếu kiểm soát. Cần cân bằng.',
    yNghiaTrading: {
      xuoi: 'Tuân thủ trading plan. Không vượt quy tắc risk management.',
      nguoc: 'Đừng quá cứng nhắc, thị trường thay đổi. Linh hoạt.',
    },
    noiDungSuPhu: `The Emperor - Hoàng Đế. Ông ta ngồi trên ngai vàng với áo giáp, sẵn sàng chiến đấu nhưng kiểm soát. Trong trading, Hoàng Đế là người có TRADING PLAN và TUÂN THỦ NÓ. Không có ngoại lệ. Không có "lần này đặc biệt". Kỷ luật là vua. Bạn có đủ can đảm để tuân thủ luật của chính mình không?`,
  },

  5: {
    so: 5,
    ten: 'The Hierophant',
    tenViet: 'Giáo Hoàng',
    tuKhoa: ['Truyền thống', 'Học hỏi', 'Mentor'],
    yNghiaChung: 'Thời điểm học hỏi từ người đi trước. Tôn trọng kiến thức cổ điển.',
    yNghiaXuoi: 'Tìm một mentor. Học các phương pháp đã được chứng minh.',
    yNghiaNguoc: 'Đừng mù quáng tin theo. Tự suy nghĩ.',
    yNghiaTrading: {
      xuoi: 'Học từ trader giỏi. Đọc sách kinh điển về trading.',
      nguoc: 'Đừng theo đám đông. Tự phân tích trước khi nghe "guru".',
    },
    noiDungSuPhu: `The Hierophant - Giáo Hoàng. Ông ấy là người giữ gìn tri thức cổ xưa. Trong trading, đây là lời nhắc: đừng phát minh lại bánh xe. Các nguyên tắc của Dow, của Wyckoff, của Livermore đã được kiểm chứng qua hơn 100 năm. Hãy học trước khi thử cách riêng. Nhưng nhớ: Giáo Hoàng chỉ đường, bạn phải tự đi.`,
  },

  6: {
    so: 6,
    ten: 'The Lovers',
    tenViet: 'Người Yêu',
    tuKhoa: ['Lựa chọn', 'Hài hòa', 'Cam kết'],
    yNghiaChung: 'Đứng trước một quyết định quan trọng. Chọn với trái tim và lý trí.',
    yNghiaXuoi: 'Quyết định đúng đắn sẽ mang lại hài hòa.',
    yNghiaNguoc: 'Mâu thuẫn nội tâm. Không chắc chắn về lựa chọn.',
    yNghiaTrading: {
      xuoi: 'Thời điểm chọn: entry hay không entry. Chọn rồi thì cam kết.',
      nguoc: 'Đang phân vân quá lâu. Ra quyết định hoặc đứng ngoài.',
    },
    noiDungSuPhu: `The Lovers - Người Yêu. Đừng chỉ nghĩ về tình yêu lãng mạn. Đây là lá bài của SỰ LỰA CHỌN. Adam và Eve đứng trước cây tri thức, phải chọn. Trong trading, bạn luôn đứng trước lựa chọn: vào hay không vào, cắt hay giữ, long hay short. Lá này nhắc: CHỌN DỨTK KHOÁT, rồi CAM KẾT với lựa chọn đó.`,
  },

  7: {
    so: 7,
    ten: 'The Chariot',
    tenViet: 'Cỗ Xe',
    tuKhoa: ['Chiến thắng', 'Ý chí', 'Kiểm soát'],
    yNghiaChung: 'Chiến thắng qua ý chí và quyết tâm. Kiểm soát các lực đối nghịch.',
    yNghiaXuoi: 'Tiến lên với quyết tâm. Chiến thắng đang đến.',
    yNghiaNguoc: 'Mất kiểm soát. Cần cân bằng lại các lực trong cuộc sống.',
    yNghiaTrading: {
      xuoi: 'Chiến lược đang hoạt động. Tiếp tục với discipline.',
      nguoc: 'Đang bị cảm xúc kéo đi nhiều hướng. Tập trung lại.',
    },
    noiDungSuPhu: `The Chariot - Cỗ Xe. Người chiến binh điều khiển hai con ngựa, một đen một trắng, kéo về hai hướng. Đây là hình ảnh của trader kiểm soát cảm xúc. Sợ hãi kéo một bên, tham lam kéo bên kia. Bạn phải làm chủ cả hai để tiến về phía trước. Chiến thắng trong trading là chiến thắng trên chính mình.`,
  },

  8: {
    so: 8,
    ten: 'Strength',
    tenViet: 'Sức Mạnh',
    tuKhoa: ['Can đảm', 'Kiên nhẫn', 'Sức mạnh nội tâm'],
    yNghiaChung: 'Sức mạnh thực sự đến từ bên trong. Kiên nhẫn và dịu dàng.',
    yNghiaXuoi: 'Bạn có sức mạnh để vượt qua. Kiên nhẫn là chìa khóa.',
    yNghiaNguoc: 'Tự nghi ngờ. Cần tin vào bản thân hơn.',
    yNghiaTrading: {
      xuoi: 'Giữ vững vị thế. Tin vào phân tích. Đừng để market noise lung lay.',
      nguoc: 'Đang để sợ hãi chi phối. Nhớ lại tại sao bạn vào lệnh.',
    },
    noiDungSuPhu: `Strength - Sức Mạnh. Một người phụ nữ nhẹ nhàng thuần hóa con sư tử. Không phải bằng bạo lực, mà bằng sự kiên nhẫn và can đảm nội tâm. Trong trading, lá này nhắc: giữ lệnh cần nhiều sức mạnh hơn vào lệnh. Khi mọi người hoảng loạn, bạn cần sức mạnh để KHÔNG hành động. Đó mới là sức mạnh thực sự.`,
  },

  9: {
    so: 9,
    ten: 'The Hermit',
    tenViet: 'Ẩn Sĩ',
    tuKhoa: ['Nội quan', 'Tìm kiếm', 'Cô độc'],
    yNghiaChung: 'Thời gian để nhìn vào bên trong. Tìm câu trả lời trong sự tĩnh lặng.',
    yNghiaXuoi: 'Rút lui để suy ngẫm. Tìm sự sáng suốt trong cô đơn.',
    yNghiaNguoc: 'Cô lập quá mức. Cần kết nối lại.',
    yNghiaTrading: {
      xuoi: 'Nghỉ ngơi và review. Không vào lệnh mới cho đến khi rõ ràng.',
      nguoc: 'Đang overthinking. Đôi khi cần hành động, không chỉ phân tích.',
    },
    noiDungSuPhu: `The Hermit - Ẩn Sĩ. Ông ta đứng một mình trên đỉnh núi, cầm ngọn đèn soi đường. Khi lá này xuất hiện, đó là lệnh NGHỈ. Rời khỏi thị trường, tắt mọi tiếng ồn, và hỏi bản thân: "Ta đang làm đúng chưa?" Sự sáng suốt không đến từ chart, nó đến từ sự tĩnh lặng bên trong.`,
  },

  10: {
    so: 10,
    ten: 'Wheel of Fortune',
    tenViet: 'Bánh Xe Vận Mệnh',
    tuKhoa: ['Chu kỳ', 'Thay đổi', 'Vận may'],
    yNghiaChung: 'Mọi thứ đều thay đổi. Chấp nhận chu kỳ của cuộc sống.',
    yNghiaXuoi: 'Vận may đang đến. Thay đổi tích cực phía trước.',
    yNghiaNguoc: 'Chống lại thay đổi. Vận xui tạm thời.',
    yNghiaTrading: {
      xuoi: 'Market cycle đang chuyển. Chuẩn bị cho trend mới.',
      nguoc: 'Đang giai đoạn khó khăn. Kiên nhẫn, chu kỳ sẽ quay.',
    },
    noiDungSuPhu: `Wheel of Fortune - Bánh Xe Vận Mệnh. Nó quay, nó luôn quay. Người ở đỉnh sẽ xuống đáy, người ở đáy sẽ lên đỉnh. Trong trading, đây là reminder về MARKET CYCLES. Bull market không kéo dài mãi, bear market cũng vậy. Đừng tham khi ở đỉnh, đừng tuyệt vọng khi ở đáy. Bánh xe sẽ quay.`,
  },

  11: {
    so: 11,
    ten: 'Justice',
    tenViet: 'Công Lý',
    tuKhoa: ['Cân bằng', 'Công bằng', 'Hậu quả'],
    yNghiaChung: 'Mọi hành động đều có hậu quả. Sự công bằng sẽ đến.',
    yNghiaXuoi: 'Kết quả xứng đáng với nỗ lực. Quyết định công bằng.',
    yNghiaNguoc: 'Bất công hoặc không chịu trách nhiệm.',
    yNghiaTrading: {
      xuoi: 'Lợi nhuận/thua lỗ phản ánh chiến lược của bạn. Chấp nhận.',
      nguoc: 'Đừng đổ lỗi cho thị trường. Nhìn lại quyết định của mình.',
    },
    noiDungSuPhu: `Justice - Công Lý. Cô ấy cầm cán cân và thanh kiếm. Không thiên vị, không cảm xúc. Trong trading, lá này nhắc: THỊ TRƯỜNG LUÔN ĐÚNG. Nếu bạn thua, đó là vì quyết định của bạn, không phải vì thị trường "bất công". Chịu trách nhiệm. Học bài học. Tiến bước.`,
  },

  12: {
    so: 12,
    ten: 'The Hanged Man',
    tenViet: 'Người Treo Ngược',
    tuKhoa: ['Góc nhìn mới', 'Hy sinh', 'Buông bỏ'],
    yNghiaChung: 'Nhìn mọi thứ từ góc độ khác. Đôi khi phải buông để được.',
    yNghiaXuoi: 'Đảo ngược suy nghĩ. Chấp nhận sự chờ đợi.',
    yNghiaNguoc: 'Bám víu quá mức. Cần buông bỏ.',
    yNghiaTrading: {
      xuoi: 'Đảo ngược bias của bạn. Nếu đang long, xem xét short.',
      nguoc: 'Đang bám vào lệnh thua. Cắt và tiến lên.',
    },
    noiDungSuPhu: `The Hanged Man - Người Treo Ngược. Anh ta treo chân ngược nhưng mặt bình an, có hào quang. Đây không phải hình phạt, đây là sự chọn lựa để thấy thế giới khác đi. Trong trading, đôi khi bạn cần ĐẢO NGƯỢC mọi thứ bạn nghĩ. Bullish? Thử bearish. Đúng? Thử sai. Sự linh hoạt tư duy là vũ khí.`,
  },

  13: {
    so: 13,
    ten: 'Death',
    tenViet: 'Cái Chết',
    tuKhoa: ['Kết thúc', 'Chuyển hóa', 'Tái sinh'],
    yNghiaChung: 'Kết thúc một giai đoạn, bắt đầu giai đoạn mới. Transformation.',
    yNghiaXuoi: 'Chấp nhận kết thúc. Cái mới sẽ đến.',
    yNghiaNguoc: 'Chống lại thay đổi. Sợ kết thúc.',
    yNghiaTrading: {
      xuoi: 'Kill một chiến lược không còn hiệu quả. Reborn với cái mới.',
      nguoc: 'Bám víu chiến lược cũ. Thị trường đã thay đổi, bạn cần thay đổi.',
    },
    noiDungSuPhu: `Death - Cái Chết. Đừng sợ lá bài này. Nó không báo hiệu cái chết thể xác. Nó báo hiệu sự KẾT THÚC của một giai đoạn. Trong trading, đôi khi bạn cần "giết" một phương pháp, một thói quen, một mindset. Điều đó không phải thất bại, đó là EVOLUTION. Chết đi để tái sinh mạnh mẽ hơn.`,
  },

  14: {
    so: 14,
    ten: 'Temperance',
    tenViet: 'Điều Độ',
    tuKhoa: ['Cân bằng', 'Kiên nhẫn', 'Hòa hợp'],
    yNghiaChung: 'Tìm điểm cân bằng. Kiên nhẫn và điều độ mang lại kết quả.',
    yNghiaXuoi: 'Cân bằng các khía cạnh cuộc sống. Kiên nhẫn.',
    yNghiaNguoc: 'Mất cân bằng. Cực đoan.',
    yNghiaTrading: {
      xuoi: 'Balance risk/reward. Không all-in, không out hoàn toàn.',
      nguoc: 'Đang quá aggressive hoặc quá conservative. Điều chỉnh.',
    },
    noiDungSuPhu: `Temperance - Điều Độ. Thiên thần đứng một chân trên nước, một chân trên đất, rót nước giữa hai cốc một cách hoàn hảo. Trong trading, đây là nghệ thuật CÂN BẰNG. Balance giữa risk và reward, giữa tự tin và khiêm tốn, giữa hành động và chờ đợi. Không cực đoan nào tốt. Trung đạo là con đường.`,
  },

  15: {
    so: 15,
    ten: 'The Devil',
    tenViet: 'Ác Quỷ',
    tuKhoa: ['Cám dỗ', 'Nghiện', 'Trói buộc'],
    yNghiaChung: 'Bị trói buộc bởi ham muốn vật chất. Nhận ra xiềng xích.',
    yNghiaXuoi: 'Nhận diện điều gì đang trói buộc bạn.',
    yNghiaNguoc: 'Bắt đầu giải thoát khỏi nghiện/thói xấu.',
    yNghiaTrading: {
      xuoi: 'Cảnh báo: đang nghiện trade, nghiện P&L, nghiện adrenaline.',
      nguoc: 'Nhận ra và bắt đầu thoát khỏi pattern tự hủy.',
    },
    noiDungSuPhu: `The Devil - Ác Quỷ. Hai người bị xích dưới chân quỷ, nhưng xích rất lỏng - họ có thể tự thoát nếu muốn. Trong trading, quỷ là SỰ NGHIỆN. Nghiện trade, nghiện kích thích, nghiện check port. Bạn có nhận ra mình đang bị xích không? Xích chỉ chặt khi bạn không nhận ra nó tồn tại.`,
  },

  16: {
    so: 16,
    ten: 'The Tower',
    tenViet: 'Ngọn Tháp',
    tuKhoa: ['Sụp đổ', 'Revelation', 'Giải phóng'],
    yNghiaChung: 'Sự sụp đổ bất ngờ của những gì được xây dựng trên nền tảng sai.',
    yNghiaXuoi: 'Chấp nhận sự sụp đổ cần thiết. Xây lại từ đầu.',
    yNghiaNguoc: 'Đang chống lại sự thay đổi không thể tránh.',
    yNghiaTrading: {
      xuoi: 'Chuẩn bị cho black swan, flash crash. Có stop loss.',
      nguoc: 'Đã tránh được thảm họa, hoặc đang phủ nhận rủi ro.',
    },
    noiDungSuPhu: `The Tower - Ngọn Tháp. Sét đánh, tháp đổ, người rơi. Đây là lá bài của BLACK SWAN. Trong trading, nó nhắc: mọi thứ có thể sụp đổ trong một khoảnh khắc. FTX, Luna, những empire tưởng như vĩnh cửu. Lá này không để dọa bạn, mà để bạn CHUẨN BỊ. Luôn có plan B. Luôn có stop loss.`,
  },

  17: {
    so: 17,
    ten: 'The Star',
    tenViet: 'Ngôi Sao',
    tuKhoa: ['Hy vọng', 'Cảm hứng', 'Phục hồi'],
    yNghiaChung: 'Sau bão là bình yên. Hy vọng và phục hồi đang đến.',
    yNghiaXuoi: 'Tin vào tương lai. Cảm hứng mới đang đến.',
    yNghiaNguoc: 'Mất hy vọng hoặc ảo tưởng không thực tế.',
    yNghiaTrading: {
      xuoi: 'Sau drawdown sẽ có recovery. Giữ niềm tin vào hệ thống.',
      nguoc: 'Đang hy vọng vô căn cứ hoặc quá bi quan.',
    },
    noiDungSuPhu: `The Star - Ngôi Sao. Sau The Tower, đây là ánh sáng cuối đường hầm. Người phụ nữ đổ nước xuống đất và ao, tái tạo sự sống. Trong trading, sau mọi drawdown lớn, có cơ hội phục hồi. Lá này nhắc: đừng bỏ cuộc sau thất bại. Học bài học, giữ hy vọng, và tiếp tục. Ngôi sao luôn ở đó, chỉ cần bạn ngước nhìn.`,
  },

  18: {
    so: 18,
    ten: 'The Moon',
    tenViet: 'Mặt Trăng',
    tuKhoa: ['Ảo giác', 'Trực giác', 'Sợ hãi'],
    yNghiaChung: 'Không phải mọi thứ như vẻ bề ngoài. Đi qua bóng tối.',
    yNghiaXuoi: 'Tin vào trực giác. Đối mặt với nỗi sợ.',
    yNghiaNguoc: 'Đang bị lừa dối hoặc tự lừa dối.',
    yNghiaTrading: {
      xuoi: 'Chart có thể đang giả. Cẩn thận với trap. Tin gut feeling.',
      nguoc: 'Đang thấy những gì muốn thấy, không phải thực tế.',
    },
    noiDungSuPhu: `The Moon - Mặt Trăng. Ánh trăng lừa dối, bóng ma xuất hiện, con đường không rõ ràng. Trong trading, đây là lá bài của MANIPULATION. Chart có thể nói dối. Pump giả, breakdown giả, tất cả được thiết kế để lừa bạn. Khi Moon xuất hiện, hãy nghi ngờ mọi thứ. Đợi ánh mặt trời để thấy rõ.`,
  },

  19: {
    so: 19,
    ten: 'The Sun',
    tenViet: 'Mặt Trời',
    tuKhoa: ['Thành công', 'Niềm vui', 'Sáng tỏ'],
    yNghiaChung: 'Ánh sáng và thành công. Mọi thứ trở nên rõ ràng.',
    yNghiaXuoi: 'Thời kỳ tốt đẹp. Thành công và hạnh phúc.',
    yNghiaNguoc: 'Thành công bị trì hoãn hoặc quá lạc quan.',
    yNghiaTrading: {
      xuoi: 'Setup rõ ràng. Entry với confidence. Thời điểm tốt.',
      nguoc: 'Đang quá confident. Nhớ risk management.',
    },
    noiDungSuPhu: `The Sun - Mặt Trời. Đứa trẻ cưỡi ngựa trắng dưới ánh mặt trời, mọi thứ rõ ràng, không có bóng tối. Trong trading, đây là những ngày mà chart "nói chuyện" với bạn, setup rõ như ban ngày. Khi có được sự sáng tỏ này, hãy hành động với confidence. Nhưng nhớ: mặt trời không chiếu mãi, đêm sẽ đến.`,
  },

  20: {
    so: 20,
    ten: 'Judgement',
    tenViet: 'Phán Xét',
    tuKhoa: ['Đánh giá', 'Tái sinh', 'Gọi tên'],
    yNghiaChung: 'Thời điểm đánh giá lại. Trả lời tiếng gọi của định mệnh.',
    yNghiaXuoi: 'Review và cải thiện. Giai đoạn mới đang gọi.',
    yNghiaNguoc: 'Tự phán xét quá harsh hoặc từ chối thay đổi.',
    yNghiaTrading: {
      xuoi: 'Review toàn bộ trading journey. Học từ quá khứ.',
      nguoc: 'Đang tự trách hoặc không chịu nhìn lại.',
    },
    noiDungSuPhu: `Judgement - Phán Xét. Thiên thần thổi kèn, người chết trỗi dậy từ mộ. Đây là lúc TỔNG KẾT. Trong trading, định kỳ bạn cần dừng lại và phán xét chính mình: chiến lược có hiệu quả không? Tâm lý có ổn định không? Bạn có đang đi đúng hướng? Đừng sợ câu trả lời. Sự thật giải phóng.`,
  },

  21: {
    so: 21,
    ten: 'The World',
    tenViet: 'Thế Giới',
    tuKhoa: ['Hoàn thành', 'Tích hợp', 'Thành tựu'],
    yNghiaChung: 'Hoàn thành một chu kỳ. Đạt được mục tiêu.',
    yNghiaXuoi: 'Mục tiêu đạt được. Chuẩn bị cho hành trình mới.',
    yNghiaNguoc: 'Gần hoàn thành nhưng chưa xong. Cần nỗ lực cuối.',
    yNghiaTrading: {
      xuoi: 'Đạt target. Chốt lời và celebrate. Chuẩn bị chu kỳ mới.',
      nguoc: 'Gần target nhưng chưa đến. Kiên nhẫn, gần rồi.',
    },
    noiDungSuPhu: `The World - Thế Giới. Vũ công trong vòng nguyệt quế, bốn sinh vật thiêng ở bốn góc. Sự hoàn thành. Trong trading, đây là khi bạn ĐẠT ĐƯỢC MỤC TIÊU. Không phải mọi ngày, nhưng những ngày đó tồn tại. Khi đến, hãy chốt. Hãy celebrate. Rồi bắt đầu chu kỳ mới. The World không phải kết thúc, mà là hoàn thành để bắt đầu lại.`,
  },
};

// ============================================================
// KINH DỊCH CƠ BẢN
// ============================================================

/**
 * 8 Quẻ cơ bản của Kinh Dịch
 * Bát Quái và ý nghĩa trong trading
 */
export const BAT_QUAI_CO_BAN = {
  CAN: {
    id: 'CAN',
    ten: 'Càn',
    tenTiengAnh: 'Heaven',
    kyHieu: '☰',
    haoViet: 'Dương Dương Dương',
    nguyenTo: 'Trời',
    tinhCach: 'Cương kiện, mạnh mẽ, sáng tạo',
    huong: 'Tây Bắc',
    yNghiaTrading: {
      xuoi: 'Xu hướng tăng mạnh. Momentum bullish. Lãnh đạo thị trường.',
      nguoc: 'Cảnh báo kiêu ngạo. Đỉnh có thể gần.',
    },
    loiKhuyen: 'Hành động quyết đoán nhưng biết dừng đúng lúc.',
    noiDungSuPhu: `Quẻ Càn - Trời. Sáu hào dương liên tiếp, biểu tượng của sức mạnh thuần khiết. Trong trading, Càn là bull market ở đỉnh cao. Tất cả đều tăng, mọi người đều lạc quan. Nhưng nhớ: "Kháng long hữu hối" - rồng bay quá cao sẽ hối hận. Đừng để sức mạnh biến thành kiêu ngạo.`,
  },

  KHON: {
    id: 'KHON',
    ten: 'Khôn',
    tenTiengAnh: 'Earth',
    kyHieu: '☷',
    haoViet: 'Âm Âm Âm',
    nguyenTo: 'Đất',
    tinhCach: 'Nhu thuận, tiếp nhận, nuôi dưỡng',
    huong: 'Tây Nam',
    yNghiaTrading: {
      xuoi: 'Thời kỳ tích lũy. Kiên nhẫn chờ đợi. Không hành động.',
      nguoc: 'Quá thụ động. Cần chủ động hơn.',
    },
    loiKhuyen: 'Như đất mẹ, kiên nhẫn nuôi dưỡng vốn của bạn.',
    noiDungSuPhu: `Quẻ Khôn - Đất. Sáu hào âm, biểu tượng của sự tiếp nhận. Trong trading, Khôn là giai đoạn KHÔNG LÀM GÌ CẢ. Thị trường sideway, không rõ hướng. Đừng cưỡng ép trade. Đất không gấp gáp, nó chờ đúng thời điểm. Bạn cũng vậy.`,
  },

  CHAN: {
    id: 'CHAN',
    ten: 'Chấn',
    tenTiengAnh: 'Thunder',
    kyHieu: '☳',
    haoViet: 'Dương Âm Âm',
    nguyenTo: 'Sấm',
    tinhCach: 'Khởi động, chấn động, bắt đầu',
    huong: 'Đông',
    yNghiaTrading: {
      xuoi: 'Breakout sắp xảy ra. Chuẩn bị hành động nhanh.',
      nguoc: 'Sốc thị trường. Volatility cao.',
    },
    loiKhuyen: 'Như tiếng sấm đầu tiên, hãy sẵn sàng cho sự thay đổi.',
    noiDungSuPhu: `Quẻ Chấn - Sấm. Một hào dương dưới hai hào âm, như sấm nổ từ lòng đất. Trong trading, Chấn là tín hiệu BREAKOUT. Sự tĩnh lặng bị phá vỡ, momentum bắt đầu. Khi thấy quẻ Chấn, hãy sẵn sàng nhảy lên tàu. Nhưng nhớ: sấm nổ nhanh và tắt nhanh, đừng trễ.`,
  },

  KHẢM: {
    id: 'KHAM',
    ten: 'Khảm',
    tenTiengAnh: 'Water',
    kyHieu: '☵',
    haoViet: 'Âm Dương Âm',
    nguyenTo: 'Nước',
    tinhCach: 'Nguy hiểm, thâm sâu, linh hoạt',
    huong: 'Bắc',
    yNghiaTrading: {
      xuoi: 'Navigating nguy hiểm với sự linh hoạt.',
      nguoc: 'Rơi vào bẫy. Cẩn thận với trap.',
    },
    loiKhuyen: 'Như nước, linh hoạt vượt qua mọi chướng ngại.',
    noiDungSuPhu: `Quẻ Khảm - Nước. Một hào dương kẹp giữa hai hào âm, như dòng nước chảy qua vực sâu. Trong trading, Khảm là giai đoạn NGUY HIỂM. Trap khắp nơi, whipsaw liên tục. Nhưng nước không chống lại đá, nó chảy vòng qua. Linh hoạt là chìa khóa. Đừng cứng đầu với một hướng.`,
  },

  CAN_NUI: {
    id: 'CAN_NUI',
    ten: 'Cấn',
    tenTiengAnh: 'Mountain',
    kyHieu: '☶',
    haoViet: 'Dương Âm Âm',
    nguyenTo: 'Núi',
    tinhCach: 'Dừng lại, vững chãi, tĩnh lặng',
    huong: 'Đông Bắc',
    yNghiaTrading: {
      xuoi: 'Dừng lại và đánh giá. Không vào lệnh mới.',
      nguoc: 'Quá bảo thủ. Bỏ lỡ cơ hội.',
    },
    loiKhuyen: 'Như núi, biết dừng đúng lúc là trí tuệ.',
    noiDungSuPhu: `Quẻ Cấn - Núi. Một hào dương trên đỉnh, hai hào âm bên dưới, như ngọn núi vững chãi. Trong trading, Cấn là lệnh DỪNG. Dừng trade, dừng suy nghĩ, dừng lại và thở. Đôi khi không hành động là hành động khôn ngoan nhất. Núi không di chuyển, nhưng nó kiểm soát cả vùng.`,
  },

  TON: {
    id: 'TON',
    ten: 'Tốn',
    tenTiengAnh: 'Wind',
    kyHieu: '☴',
    haoViet: 'Âm Dương Dương',
    nguyenTo: 'Gió',
    tinhCach: 'Nhẹ nhàng, từ từ, len lỏi',
    huong: 'Đông Nam',
    yNghiaTrading: {
      xuoi: 'Tăng từ từ, bền vững. Accumulation âm thầm.',
      nguoc: 'Thiếu quyết đoán. Dao động.',
    },
    loiKhuyen: 'Như gió, len lỏi vào từng cơ hội nhỏ.',
    noiDungSuPhu: `Quẻ Tốn - Gió. Một hào âm dưới hai hào dương, như gió len lỏi qua kẽ hở. Trong trading, Tốn là chiến lược DCA, mua từ từ, không vội vàng. Gió không mạnh như sấm, nhưng nó đi được khắp nơi. Kiên nhẫn tích lũy, từng chút một, sẽ tạo nên núi.`,
  },

  LY: {
    id: 'LY',
    ten: 'Ly',
    tenTiengAnh: 'Fire',
    kyHieu: '☲',
    haoViet: 'Dương Âm Dương',
    nguyenTo: 'Lửa',
    tinhCach: 'Sáng sủa, bám víu, phụ thuộc',
    huong: 'Nam',
    yNghiaTrading: {
      xuoi: 'Clarity trong phân tích. Nhìn rõ trend.',
      nguoc: 'Quá cảm tính. Đốt tiền vì nóng vội.',
    },
    loiKhuyen: 'Như lửa, soi sáng con đường nhưng đừng để bị đốt.',
    noiDungSuPhu: `Quẻ Ly - Lửa. Hai hào dương kẹp một hào âm, như ngọn lửa bám vào củi. Trong trading, Ly là sự SÁNG TỎ. Bạn thấy rõ trend, thấy rõ setup. Nhưng lửa cũng cần củi để cháy - đừng để passion đốt cháy tài khoản. Sử dụng sự sáng suốt, nhưng kiểm soát ngọn lửa bên trong.`,
  },

  DOAI: {
    id: 'DOAI',
    ten: 'Đoài',
    tenTiengAnh: 'Lake',
    kyHieu: '☱',
    haoViet: 'Âm Dương Dương',
    nguyenTo: 'Đầm',
    tinhCach: 'Vui vẻ, trao đổi, giao tiếp',
    huong: 'Tây',
    yNghiaTrading: {
      xuoi: 'Thời điểm tốt cho community, chia sẻ.',
      nguoc: 'Quá vui mừng với lợi nhuận. Overconfidence.',
    },
    loiKhuyen: 'Như hồ nước, phản chiếu sự thật và mang lại niềm vui.',
    noiDungSuPhu: `Quẻ Đoài - Đầm. Một hào âm trên hai hào dương, như mặt hồ tĩnh lặng. Trong trading, Đoài là sự HÀI LÒNG sau chiến thắng. Nhưng nhớ: hồ quá đầy sẽ tràn. Enjoy lợi nhuận nhưng đừng để niềm vui biến thành kiêu ngạo. Chốt lời, celebrate, rồi trở lại với tâm trống rỗng.`,
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Lấy trạng thái Hawkins theo tần số
 * @param {number} frequency - Tần số Hz
 * @returns {Object|null} Trạng thái tương ứng
 */
export function getHawkinsStateByFrequency(frequency) {
  const states = Object.values(HAWKINS_SCALE);

  // Tìm trạng thái gần nhất với tần số
  let closestState = null;
  let minDiff = Infinity;

  for (const state of states) {
    const diff = Math.abs(state.tanSo - frequency);
    if (diff < minDiff) {
      minDiff = diff;
      closestState = state;
    }
  }

  return closestState;
}

/**
 * Lấy quy chế trading theo tần số
 * @param {number} frequency - Tần số Hz
 * @returns {string} Quy chế trading
 */
export function getTradingRuleByFrequency(frequency) {
  const state = getHawkinsStateByFrequency(frequency);
  return state ? state.quyCheTrading : 'KHÔNG XÁC ĐỊNH';
}

/**
 * Kiểm tra có nên trade không dựa trên tần số
 * @param {number} frequency - Tần số Hz
 * @returns {Object} { canTrade: boolean, rule: string, advice: string }
 */
export function checkTradingPermission(frequency) {
  const state = getHawkinsStateByFrequency(frequency);

  if (!state) {
    return {
      canTrade: false,
      rule: 'KHÔNG XÁC ĐỊNH',
      advice: 'Không thể xác định trạng thái tần số.',
    };
  }

  const noTradeRules = ['KHÔNG ĐƯỢC TRADE', 'DỪNG TRADE 24H'];
  const limitedRules = ['CHỈ TRADE SIZE NHỎ', 'GIỚI HẠN SỐ LỆNH', 'GIỮ NGUYÊN SIZE'];

  let canTrade = true;
  let advice = state.noiDungSuPhu;

  if (noTradeRules.includes(state.quyCheTrading)) {
    canTrade = false;
    advice = state.cachNangTanSo ? state.cachNangTanSo.join(' ') : state.noiDungSuPhu;
  }

  return {
    canTrade,
    rule: state.quyCheTrading,
    state: state.ten,
    frequency: state.tanSo,
    advice,
    fullContent: state.noiDungSuPhu,
  };
}

/**
 * Lấy đá phong thủy phù hợp với mục đích
 * @param {string} purpose - 'protection', 'luck', 'intuition', 'courage', 'abundance'
 * @returns {Array} Danh sách đá phù hợp
 */
export function getStonesByPurpose(purpose) {
  const purposeMap = {
    protection: ['TOURMALINE_DEN', 'PYRITE'],
    luck: ['AVENTURINE_XANH', 'THACH_ANH_VANG'],
    intuition: ['THACH_ANH_TIM', 'LABRADORITE'],
    courage: ['MAT_HO', 'PYRITE'],
    abundance: ['THACH_ANH_VANG', 'AVENTURINE_XANH'],
    balance: ['THACH_ANH_TIM', 'TOURMALINE_DEN'],
  };

  const stoneIds = purposeMap[purpose] || [];
  return stoneIds.map(id => DA_PHONG_THUY_TRADING[id]).filter(Boolean);
}

/**
 * Lấy lá Tarot theo số
 * @param {number} cardNumber - Số từ 0-21
 * @returns {Object|null} Thông tin lá bài
 */
export function getTarotCard(cardNumber) {
  return MAJOR_ARCANA_TAROT[cardNumber] || null;
}

/**
 * Rút một lá Tarot ngẫu nhiên
 * @param {boolean} includeReversed - Có bao gồm lá ngược không
 * @returns {Object} { card: Object, isReversed: boolean }
 */
export function drawRandomTarotCard(includeReversed = true) {
  const cardNumber = Math.floor(Math.random() * 22);
  const card = MAJOR_ARCANA_TAROT[cardNumber];
  const isReversed = includeReversed ? Math.random() < 0.5 : false;

  return {
    card,
    isReversed,
    meaning: isReversed ? card.yNghiaNguoc : card.yNghiaXuoi,
    tradingMeaning: isReversed ? card.yNghiaTrading.nguoc : card.yNghiaTrading.xuoi,
  };
}

/**
 * Lấy quẻ Kinh Dịch theo ID
 * @param {string} queId - ID của quẻ (CAN, KHON, etc.)
 * @returns {Object|null} Thông tin quẻ
 */
export function getKinhDichQue(queId) {
  return BAT_QUAI_CO_BAN[queId.toUpperCase()] || null;
}

/**
 * Tìm kiếm trong kho kiến thức tâm linh
 * @param {string} query - Từ khóa tìm kiếm
 * @returns {Array} Kết quả tìm kiếm
 */
export function searchSpiritualKnowledge(query) {
  const results = [];
  const queryLower = query.toLowerCase();

  // Tìm trong Hawkins Scale
  for (const [key, state] of Object.entries(HAWKINS_SCALE)) {
    if (
      state.ten.toLowerCase().includes(queryLower) ||
      state.tenTiengAnh.toLowerCase().includes(queryLower) ||
      state.moTa.toLowerCase().includes(queryLower)
    ) {
      results.push({
        type: 'HAWKINS_STATE',
        id: key,
        ten: state.ten,
        content: state.noiDungSuPhu,
        data: state,
      });
    }
  }

  // Tìm trong Trạng Thái Nguy Hiểm
  for (const [key, state] of Object.entries(TRANG_THAI_NGUY_HIEM)) {
    if (
      state.ten.toLowerCase().includes(queryLower) ||
      state.tenTiengAnh.toLowerCase().includes(queryLower) ||
      state.moTa.toLowerCase().includes(queryLower)
    ) {
      results.push({
        type: 'DANGEROUS_STATE',
        id: key,
        ten: state.ten,
        content: state.noiDungSuPhu,
        data: state,
      });
    }
  }

  // Tìm trong Đá Phong Thủy
  for (const [key, stone] of Object.entries(DA_PHONG_THUY_TRADING)) {
    if (
      stone.ten.toLowerCase().includes(queryLower) ||
      stone.tenTiengAnh.toLowerCase().includes(queryLower) ||
      stone.congDung.some(cd => cd.toLowerCase().includes(queryLower))
    ) {
      results.push({
        type: 'FENG_SHUI_STONE',
        id: key,
        ten: stone.ten,
        content: stone.noiDungSuPhu,
        data: stone,
      });
    }
  }

  // Tìm trong Tarot
  for (const [key, card] of Object.entries(MAJOR_ARCANA_TAROT)) {
    if (
      card.ten.toLowerCase().includes(queryLower) ||
      card.tenViet.toLowerCase().includes(queryLower) ||
      card.tuKhoa.some(tk => tk.toLowerCase().includes(queryLower))
    ) {
      results.push({
        type: 'TAROT_CARD',
        id: key,
        ten: card.tenViet,
        content: card.noiDungSuPhu,
        data: card,
      });
    }
  }

  // Tìm trong Bát Quái
  for (const [key, que] of Object.entries(BAT_QUAI_CO_BAN)) {
    if (
      que.ten.toLowerCase().includes(queryLower) ||
      que.tenTiengAnh.toLowerCase().includes(queryLower) ||
      que.nguyenTo.toLowerCase().includes(queryLower)
    ) {
      results.push({
        type: 'KINH_DICH',
        id: key,
        ten: que.ten,
        content: que.noiDungSuPhu,
        data: que,
      });
    }
  }

  return results;
}

// ============================================================
// EXPORT ALL
// ============================================================

export default {
  HAWKINS_SCALE,
  TRANG_THAI_NGUY_HIEM,
  DA_PHONG_THUY_TRADING,
  MAJOR_ARCANA_TAROT,
  BAT_QUAI_CO_BAN,
  // Helper functions
  getHawkinsStateByFrequency,
  getTradingRuleByFrequency,
  checkTradingPermission,
  getStonesByPurpose,
  getTarotCard,
  drawRandomTarotCard,
  getKinhDichQue,
  searchSpiritualKnowledge,
};
