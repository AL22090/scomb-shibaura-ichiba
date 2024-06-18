/**
 * @name content.js
 * @description このスクリプトは，https://scombz.shibaura-it.ac.jp/lms/timetableにボタンを追加し，ボタンをクリックすると時間割情報をクリップボードにコピーするChrome拡張機能．
 * 
 * @since 2024/06/08
 * @author 小島佑太
 * 
 * @version 1.0
 */



// ボタンを作成
//todo スマホでの表示に対応する
let button = document.createElement('button');
button.textContent = 'クリップボードに時間割情報をコピー';
button.style.position = 'absolute';
button.style.top = '100px';
button.style.right = '50px';
button.style.backgroundColor = 'blue';
button.style.color = 'white';
button.style.padding = '10px 20px';
button.style.zIndex = 1000;

button.addEventListener('click', () => {
    askToCopy();
});

// ドキュメントが読み込み終わったらボタンを表示する
document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(button);
});

/**
 * @function askToCopy
 * @description 時間割情報をクリップボードにコピーするかどうかを尋ねるウィンドウを表示する．yesボタンを押すと時間割情報をクリップボードにコピーする関数を呼び出す．
 * @param {void}
 * @return {void}
 * 
 * @since 2024/06/08
 * @author 小島佑太
 */
function askToCopy(){
    //ウィンドウを作成
    //todo スマホでの表示に対応する
    const window = document.createElement('div');
    window.id = 'askToCopyWindow';
    window.style.position = 'absolute';
    window.style.top = '0';
    window.style.left = '0';
    window.style.width = '100%';
    window.style.height = '100%';
    window.style.backgroundColor = 'rgba(255,255,255,1)';
    window.display = 'flex';
    window.style.alignItems = 'center';
    window.style.justifyContent = 'center';
    window.style.zIndex = 1001;
    document.body.appendChild(window);

    //規約文を表示
    const messageDiv = document.createElement('div');
    const message = document.createElement('pre');

    message.textContent = setMessage();
    messageDiv.appendChild(message);
    window.appendChild(messageDiv);


    //yesボタンを作成，クリック時に時間割情報をクリップボードにコピーする関数を呼び出し，ウィンドウを閉じる
    const yesButton = document.createElement('button');
    yesButton.textContent = '規約に同意して時間割情報をクリップボードにコピー';
    yesButton.addEventListener('click', () => {
        copyToClipboard();
        window.remove();
    });
    window.appendChild(yesButton);

    //noボタンを作成，クリック時にウィンドウを閉じる
    const noButton = document.createElement('button');
    noButton.textContent = 'キャンセル';
    noButton.addEventListener('click', () => {
        window.remove();
    });
    window.appendChild(noButton);
}

/**
 * @function copyToClipboard
 * @description 時間割情報を取得し，クリップボードにコピーする．
 * @param {void}
 * @return {void}
 * 
 * @since 2024/06/08
 * @author 小島佑太
 */
function copyToClipboard(){
    //todo: 時間割情報を取得する
    const timetable = getTimeTable();
    //クリップボードにコピーする
    navigator.clipboard.writeText(timetable);
    console.log('copied');
}


const Enum_day = Object.freeze({
    MON: 0,
    TUE: 1,
    WED: 2,
    THU: 3,
    FRI: 4,
    SAT: 5,
    SUN: 6
});

/**
 * @function getTimeTable
 * @description 時間割情報を取得する．
 * @param {void}
 * @return {string} 時間割情報
 * 
 * @since 2024/06/08
 * @author 小島佑太
 */
function getTimeTable(){
    let str = "";

    //時間割全体のdivを取得
    const timetable = Array.from(document.getElementsByClassName('div-table-data-row'));

    //時間割の行（時間）ごとに処理
    let time = 1;
    timetable.forEach((row) => {
        //各時間ごとの列要素（曜日）を取得
        const col = [];
        const yobicol_1 = row.getElementsByClassName('div-table-cell 1-yobicol')[0]; //月曜日
        const yobicol_2 = row.getElementsByClassName('div-table-cell 2-yobicol')[0]; //火曜日
        const yobicol_3 = row.getElementsByClassName('div-table-cell 3-yobicol')[0]; //水曜日
        const yobicol_4 = row.getElementsByClassName('div-table-cell 4-yobicol')[0]; //木曜日
        const yobicol_5 = row.getElementsByClassName('div-table-cell 5-yobicol')[0]; //金曜日
        const yobicol_6 = row.getElementsByClassName('div-table-cell 6-yobicol')[0]; //土曜日

        col.push(yobicol_1);
        col.push(yobicol_2);
        col.push(yobicol_3);
        col.push(yobicol_4);
        col.push(yobicol_5);
        col.push(yobicol_6);

        //時間割のセルごとに処理，ただし，クォーター制の授業を第１，第２クォーターの両方取っている場合，両方の情報がcellに含まれるため，両方の情報を取得する
        let day = Enum_day.MON;
        col.forEach((cell)=>{
            try{
                const class_data = Array.from(cell.getElementsByClassName('clearfix permit-student'));
                if(class_data.length > 0){
                    class_data.forEach((data) => {
                        const detail = data.getElementsByClassName('div-table-cell-detail')[0];
                        const teacherNames = detail.querySelectorAll('span');
                        let teacherName = "";
                        teacherNames.forEach((name) => {
                            //nameから,を削除
                            let tmp = name.textContent;
                            tmp = tmp.replace(",", "");
                            //nameの冒頭のスペースを削除
                            tmp = tmp.trimStart();
                            teacherName += tmp;
                            teacherName += ", ";
                        });
                        //最後の,を削除
                        teacherName = teacherName.slice(0, -2);
                        str += /*getDay(day) + ", " + time + ", " + */getNameOfClass(data.textContent) + ", " + teacherName + "\n"; // 曜日と時限は必要なくなった．
                    });
                }
                day = (day + 1) % 7;
            }catch(e){ // エラーが発生した場合，その授業はスキップする．
                console.error(e);
            }
        });
        time++;
    });

    console.log(str);
    return str;
}

/**
 * @function getDay
 * @description enum型の曜日を日本語に変換する．
 * @param {int} day 曜日を表すenum型
 * @return {string} 日本語の曜日，{月, 火, 水, 木, 金, 土, 日}のいずれか，エラーの場合は"エラー"
 * 
 * @since 2024/06/08
 * @auther 小島佑太
 */
function getDay(day){
    switch(day){
        case Enum_day.MON:
            return "月";
        case Enum_day.TUE:
            return "火";
        case Enum_day.WED:
            return "水";
        case Enum_day.THU:
            return "木";
        case Enum_day.FRI:
            return "金";
        case Enum_day.SAT:
            return "土";
        case Enum_day.SUN:
            return "日";
        default:
            return "エラー";
    }
}


/**
 * @function getNameOfClass
 * @description 授業名を取得する．
 * @param {string} str 授業名が含まれる文字列，形式は<空白>*[授業名]<空白>*[その他の情報]*
 * @return {string} 授業名
 * 
 * @since 2024/06/08
 * @auther 小島佑太
 */
function getNameOfClass(str){
    /*
        入力形式
        <空白>*[授業名]<空白>*[その他の情報]*
        出力形式
        [授業名]
    */

    //正規表現で授業名を取得
    const regex = /(\s*)(\S*)(\.*)/;
    let className = str.match(regex)[2];

    //(１Q)と(２Q)を削除
    className = className.replace("(１Q)", "");
    className = className.replace("(２Q)", "");

    return className;
}


/**
 * @function setMessage
 * @description 規約文を返す．
 * @param {void}
 * @return {string} 規約文
 * 
 * @since 2024/06/08
 * @author 小島佑太 
 */
function setMessage(){
    /*
        このChrome拡張機能は，時間割情報をクリップボードにコピーするために作成されました．この情報は，芝浦市場に時間割情報を入力するために使用されます．

        機能の概要:
        ・規約に同意して時間割情報をクリップボードにコピーボタンをクリックすると，時間割情報がクリップボードにコピーされます．
        ・時間割情報は，曜日，時限，授業名，教員名の順に表示されます．
        ・ただし，教員名の部分に，休校など，別の情報が表示される場合があります．
        ・この時間割を芝浦市場にCtrl-vで張り付けることで，時間割情報を芝浦市場に入力できます．

        同意:
        ・この拡張機能を使用することで，時間割情報がクリップボードにコピーされます．
        ・この情報は，拡張機能が提供する，時間割情報をクリップボードにコピーする機能以外の目的でつかわれることはありません．

        情報の安全性:
        ・この拡張機能は，ユーザのデバイス内のみで動作します．
        ・時間割情報は外部に送信されることはありません．
        ・クリップボードにコピーされた情報は，ユーザがペーストするまで，ユーザのデバイス内にとどまります．

        注意:
        ・この拡張機能でクリップボードにコピーされた時間割情報の扱いには十分注意してください．
        ・この拡張機能で入手した時間割情報の使用について，開発者は一切の責任を負いません．

        この規約に同意する場合，「規約に同意して時間割情報をクリップボードにコピー」ボタンをクリックしてください．
    */


    const message = "このChrome拡張機能は，時間割情報をクリップボードにコピーするために作成されました．この情報は，芝浦市場に時間割情報を入力するために使用されます．\n\n" +
                    "機能の概要:\n" +
                    "・規約に同意して時間割情報をクリップボードにコピーボタンをクリックすると，時間割情報がクリップボードにコピーされます．\n" +
                    "・時間割情報は，曜日，時限，授業名，教員名の順に表示されます．\n" +
                    "・ただし，教員名の部分に，休校など，別の情報が表示される場合があります．\n" +
                    "・この時間割を芝浦市場にCtrl-vで張り付けることで，時間割情報を芝浦市場に入力できます．\n\n" +
                    "同意:\n" +
                    "・この拡張機能を使用することで，時間割情報がクリップボードにコピーされます．\n" +
                    "・この情報は，拡張機能が提供する，時間割情報をクリップボードにコピーする機能以外の目的でつかわれることはありません．\n\n" +
                    "情報の安全性:\n" +
                    "・この拡張機能は，ユーザのデバイス内のみで動作します．\n" +
                    "・時間割情報は外部に送信されることはありません．\n" +
                    "・クリップボードにコピーされた情報は，ユーザがペーストするまで，ユーザのデバイス内にとどまります．\n\n" +
                    "注意:\n" +
                    "・この拡張機能でクリップボードにコピーされた時間割情報の扱いには十分注意してください．\n" +
                    "・この拡張機能で入手した時間割情報の使用について，開発者は一切の責任を負いません．\n\n" +
                    "この規約に同意する場合，「規約に同意して時間割情報をクリップボードにコピー」ボタンをクリックしてください．";

    return message;
}



