// scripts/seed-firebase.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const crypto = require('crypto');

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyACKDt7_XtJPUtYdNposwPmh9y1bG4Xnho",
  authDomain: "baby-helmet-opti-dev.firebaseapp.com",
  projectId: "baby-helmet-opti-dev",
  storageBucket: "baby-helmet-opti-dev.firebasestorage.app",
  messagingSenderId: "181216454863",
  appId: "1:181216454863:web:c7e7f180750126cd652fba"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// パスワードハッシュ化関数 (SHA-256)
function hashPassword(plainPassword) {
  return crypto.createHash('sha256').update(plainPassword).digest('hex');
}

// ユーザーデータ作成関数
async function createTestUsers() {
  try {
    console.log('🔐 パスワードハッシュ化中...');

    // テスト用パスワードをSHA-256でハッシュ化
    const hospitalPassword = hashPassword('4rfv%TGB6yhn');
    const customer1Password = hashPassword('4rfv%TGB6yhn');
    const customer2Password = hashPassword('4rfv%TGB6yhn');
    const customer3Password = hashPassword('4rfv%TGB6yhn');
    const customer4Password = hashPassword('4rfv%TGB6yhn');
    const customer5Password = hashPassword('4rfv%TGB6yhn');
    const customer6Password = hashPassword('4rfv%TGB6yhn');
    const customer7Password = hashPassword('4rfv%TGB6yhn');
    const customer8Password = hashPassword('4rfv%TGB6yhn');
    const customer9Password = hashPassword('4rfv%TGB6yhn');
    const customer10Password = hashPassword('4rfv%TGB6yhn');
    const customer11Password = hashPassword('4rfv%TGB6yhn');
    const customer12Password = hashPassword('4rfv%TGB6yhn');
    const customer13Password = hashPassword('4rfv%TGB6yhn');
    const customer14Password = hashPassword('4rfv%TGB6yhn');
    const customer15Password = hashPassword('4rfv%TGB6yhn');

    console.log('✅ パスワードハッシュ化完了');
    console.log('📝 Firestoreにデータ登録中...');

    // 病院スタッフユーザー
    const hospitalUser = {
      hospital_member_id: "HOSP001",
      email_address: "hospital@test.com",
      family_name: "山田",
      first_name: "太郎",
      password: hospitalPassword,
      userId: "hospital_user_001",
      user_type: "hospital"
    };

    // 顧客ユーザー1
    const customer1 = {
      baby_born_day: "15",
      baby_born_month: "03",
      baby_born_year: "2022",
      baby_family_name: "才川",
      baby_first_name: "純一",
      consultation_id: "C001",
      email_address: "jyunichisaikawa@gmail.com",
      parent_family_name: "田中",
      parent_first_name: "一郎",
      password: customer1Password,
      userId: "customer_user_001",
      user_type: "customer"
    };

    // 顧客ユーザー2
    const customer2 = {
      baby_born_day: "20",
      baby_born_month: "07",
      baby_born_year: "2023",
      baby_family_name: "佐藤",
      baby_first_name: "健太",
      consultation_id: "C002",
      email_address: "customer2@test.com",
      parent_family_name: "佐藤",
      parent_first_name: "美香",
      password: customer2Password, // ハッシュ化されたパスワード
      // password:"pass",
      userId: "customer_user_002",
      user_type: "customer"
    };

    // 顧客ユーザー3
    const customer3 = {
        baby_born_day: "11",
        baby_born_month: "04",
        baby_born_year: "2022",
        baby_family_name: "石田",
        baby_first_name: "良助",
        consultation_id: "C003",
        email_address: "ishida@test.com",
        parent_family_name: "石田",
        parent_first_name: "京子",
        password: customer3Password, // ハッシュ化されたパスワード
        // password:"pass",
        userId: "customer_user_003",
        user_type: "customer"
      };
  
    // 顧客ユーザー4
    const customer4 = {
        baby_born_day: "01",
        baby_born_month: "03",
        baby_born_year: "2015",
        baby_family_name: "中山",
        baby_first_name: "啓介",
        consultation_id: "C004",
        email_address: "nakayama@test.com",
        parent_family_name: "中山",
        parent_first_name: "恵子",
        password: customer4Password, // ハッシュ化されたパスワード
        // password:"pass",
        userId: "customer_user_004",
        user_type: "customer"
      };
  
    // 顧客ユーザー5
    const customer5 = {
        baby_born_day: "20",
        baby_born_month: "07",
        baby_born_year: "2011",
        baby_family_name: "岸",
        baby_first_name: "信介",
        consultation_id: "C005",
        email_address: "kishi@test.com",
        parent_family_name: "岸",
        parent_first_name: "政治",
        password: customer5Password, // ハッシュ化されたパスワード
        // password:"pass",
        userId: "customer_user_005",
        user_type: "customer"
      };
  
    // 顧客ユーザー6
    const customer6 = {
        baby_born_day: "20",
        baby_born_month: "01",
        baby_born_year: "2025",
        baby_family_name: "小山",
        baby_first_name: "太",
        consultation_id: "C006",
        email_address: "koyama@test.com",
        parent_family_name: "小山",
        parent_first_name: "雄太",
        password: customer6Password, // ハッシュ化されたパスワード
        // password:"pass",
        userId: "customer_user_006",
        user_type: "customer"
      };
  
    // 顧客ユーザー7
    const customer7 = {
        baby_born_day: "20",
        baby_born_month: "07",
        baby_born_year: "2022",
        baby_family_name: "石川",
        baby_first_name: "健太",
        consultation_id: "C007",
        email_address: "ishikawa@test.com",
        parent_family_name: "石川",
        parent_first_name: "洋子",
        password: customer7Password, // ハッシュ化されたパスワード
        // password:"pass",
        userId: "customer_user_007",
        user_type: "customer"
      };

    // 顧客ユーザー8
    const customer8 = {
        baby_born_day: "20",
        baby_born_month: "07",
        baby_born_year: "2024",
        baby_family_name: "一ノ瀬",
        baby_first_name: "タロウ",
        consultation_id: "C008",
        email_address: "ichinose@test.com",
        parent_family_name: "一ノ瀬",
        parent_first_name: "ケイコ",
        password: customer8Password, // ハッシュ化されたパスワード
        // password:"pass",
        userId: "customer_user_008",
        user_type: "customer"
      };

    // 顧客ユーザー9
    const customer9 = {
        baby_born_day: "11",
        baby_born_month: "11",
        baby_born_year: "2011",
        baby_family_name: "近藤",
        baby_first_name: "博",
        consultation_id: "C009",
        email_address: "kondou@test.com",
        parent_family_name: "近藤",
        parent_first_name: "道子",
        password: customer9Password, // ハッシュ化されたパスワード
        // password:"pass",
        userId: "customer_user_009",
        user_type: "customer"
      };

    // 顧客ユーザー10
    const customer10 = {
        baby_born_day: "12",
        baby_born_month: "12",
        baby_born_year: "2012",
        baby_family_name: "山川",
        baby_first_name: "博",
        consultation_id: "C010",
        email_address: "yamakawa@test.com",
        parent_family_name: "山川",
        parent_first_name: "狭し",
        password: customer10Password, // ハッシュ化されたパスワード
        // password:"pass",
        userId: "customer_user_010",
        user_type: "customer"
      };

    // 顧客ユーザー11
    const customer11 = {
        baby_born_day: "02",
        baby_born_month: "02",
        baby_born_year: "2020",
        baby_family_name: "三田",
        baby_first_name: "健太",
        consultation_id: "C011",
        email_address: "ishikawa@test.com",
        parent_family_name: "三田",
        parent_first_name: "翔太",
        password: customer11Password, // ハッシュ化されたパスワード
        // password:"pass",
        userId: "customer_user_011",
        user_type: "customer"
      };

    // 顧客ユーザー12
    const customer12 = {
        baby_born_day: "20",
        baby_born_month: "07",
        baby_born_year: "2022",
        baby_family_name: "石河",
        baby_first_name: "健多",
        consultation_id: "C012",
        email_address: "ishikawa@test.com",
        parent_family_name: "石河",
        parent_first_name: "陽子",
        password: customer12Password, // ハッシュ化されたパスワード
        // password:"pass",
        userId: "customer_user_012",
        user_type: "customer"
      };

    // 顧客ユーザー13
    const customer13 = {
        baby_born_day: "20",
        baby_born_month: "07",
        baby_born_year: "2022",
        baby_family_name: "石川",
        baby_first_name: "健太",
        consultation_id: "C013",
        email_address: "ishikawa@test.com",
        parent_family_name: "石川",
        parent_first_name: "洋子",
        password: customer13Password, // ハッシュ化されたパスワード
        // password:"pass",
        userId: "customer_user_013",
        user_type: "customer"
      };

    // 顧客ユーザー14
    const customer14 = {
        baby_born_day: "20",
        baby_born_month: "07",
        baby_born_year: "2022",
        baby_family_name: "石川",
        baby_first_name: "健太",
        consultation_id: "C014",
        email_address: "ishikawa@test.com",
        parent_family_name: "石川",
        parent_first_name: "洋子",
        password: customer14Password, // ハッシュ化されたパスワード
        // password:"pass",
        userId: "customer_user_014",
        user_type: "customer"
      };

    // 顧客ユーザー15
    const customer15 = {
        baby_born_day: "20",
        baby_born_month: "07",
        baby_born_year: "2022",
        baby_family_name: "石川",
        baby_first_name: "健太",
        consultation_id: "C015",
        email_address: "ishikawa@test.com",
        parent_family_name: "石川",
        parent_first_name: "洋子",
        password: customer15Password, // ハッシュ化されたパスワード
        // password:"pass",
        userId: "customer_user_015",
        user_type: "customer"
      };













      await setDoc(doc(db, 'users', hospitalUser.userId), hospitalUser);
      await setDoc(doc(db, 'users', customer1.userId), customer1);
      await setDoc(doc(db, 'users', customer2.userId), customer2);
      await setDoc(doc(db, 'users', customer3.userId), customer3);
      await setDoc(doc(db, 'users', customer4.userId), customer4);
      await setDoc(doc(db, 'users', customer5.userId), customer5);
      await setDoc(doc(db, 'users', customer6.userId), customer6);
      await setDoc(doc(db, 'users', customer7.userId), customer7);
      await setDoc(doc(db, 'users', customer8.userId), customer8);
      await setDoc(doc(db, 'users', customer9.userId), customer9);
      // await setDoc(doc(db, 'users', customer10.uerId), customer10);
      // await setDoc(doc(db, 'users', customer11.userId), customer11);
      // await setDoc(doc(db, 'users', customer12.userId), customer12);
      // await setDoc(doc(db, 'users', customer13.userId), customer13);
      // await setDoc(doc(db, 'users', customer14.userId), customer14);
      // await setDoc(doc(db, 'users', customer15.userId), customer15);

    // Firestoreに登録
    // const usersCollection = collection(db, 'users');
    
    // await addDoc(usersCollection, hospitalUser);
    // console.log('✅ 病院スタッフユーザー登録完了');
    
    // await addDoc(usersCollection, customer1);
    // console.log('✅ 顧客ユーザー1登録完了');
    
    // await addDoc(usersCollection, customer2);
    // console.log('✅ 顧客ユーザー2登録完了');

    // await addDoc(usersCollection, customer3);
    // console.log('✅ 顧客ユーザー3登録完了');

    // await addDoc(usersCollection, customer4);
    // console.log('✅ 顧客ユーザー4登録完了');

    // await addDoc(usersCollection, customer5);
    // console.log('✅ 顧客ユーザー5登録完了');

    // await addDoc(usersCollection, customer6);
    // console.log('✅ 顧客ユーザー6登録完了');

    // await addDoc(usersCollection, customer7);
    // console.log('✅ 顧客ユーザー7登録完了');

    // await addDoc(usersCollection, customer8);
    // console.log('✅ 顧客ユーザー8登録完了');

    // await addDoc(usersCollection, customer9);
    // console.log('✅ 顧客ユーザー9登録完了');

    // await addDoc(usersCollection, customer10);
    // console.log('✅ 顧客ユーザー10登録完了');

    // await addDoc(usersCollection, customer11);
    // console.log('✅ 顧客ユーザー11登録完了');

    // await addDoc(usersCollection, customer12);
    // console.log('✅ 顧客ユーザー12登録完了');

    // await addDoc(usersCollection, customer13);
    // console.log('✅ 顧客ユーザー13登録完了');

    // await addDoc(usersCollection, customer14);
    // console.log('✅ 顧客ユーザー14登録完了');

    // await addDoc(usersCollection, customer15);
    // console.log('✅ 顧客ユーザー15登録完了');


    console.log('\n🎉 全てのテストデータ登録が完了しました！');
    
    console.log('\n📋 ログインテスト用の情報:');
    console.log('----------------------------------------');
    console.log('🏥 病院スタッフ:');
    console.log('   Email: hospital@test.com');
    console.log('   Password: hospital123');
    console.log('\n👶 顧客1 (田中 花子):');
    console.log('   Email: customer1@test.com');
    console.log('   Password: customer123');
    console.log('\n👶 顧客2 (佐藤 健太):');
    console.log('   Email: customer2@test.com');
    console.log('   Password: customer456');
    console.log('----------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
createTestUsers();