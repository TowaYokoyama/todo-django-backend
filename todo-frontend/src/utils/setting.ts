
import AsyncStorage from '@react-native-async-storage/async-storage';


const NOTIFICATION_SETTING_KEY = '@user_notification_setting';


type NotificationSetting = {
  isEnabled: boolean;
};

export const saveNotificationSetting = async (setting: NotificationSetting): Promise<void> => {
  try {
    
    const jsonValue = JSON.stringify(setting);
    
    
    await AsyncStorage.setItem(NOTIFICATION_SETTING_KEY, jsonValue);

    console.log('設定を保存しました:', jsonValue); // 確認用ログ

  } catch (e) {
    // もし保存に失敗したら、エラーを記録します。
    console.error('設定の保存に失敗しました。', e);
  }
};


export const getNotificationSetting = async (): Promise<NotificationSetting> => {
  try {

    const jsonValue = await AsyncStorage.getItem(NOTIFICATION_SETTING_KEY);
    
    
    if (jsonValue !== null) {
      console.log('設定を読み込みました:', jsonValue); // 確認用ログ
      // 文字列をプログラムが扱えるオブジェクトの形に戻して、返します。
      return JSON.parse(jsonValue);
    }

    // もし引き出しが空っぽ（初回起動など）だった場合...
    console.log('保存されている設定がありません。デフォルト値を返します。');
    // とりあえず「通知はオン」という初期設定を返すことにします。
    return { isEnabled: true }; 
    
  } catch (e) {
    // もし読み込みに失敗したら、エラーを記録します。
    console.error('設定の読み込みに失敗しました。', e);
    // 困るので、とりあえず「通知はオン」ということにしておきます。
    return { isEnabled: true };
  }
};