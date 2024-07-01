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
 * 
 * @modified 2024/7/1 - 小島佑太 時限と曜日の削除に伴い，プログラムの簡略化をした
 */
function getTimeTable(){
    let str = "";

    const cells = Array.from(document.getElementsByClassName('permit-student'));
    cells.forEach((cell) => {
        //cellのInnerTextを取得
        const text = cell.innerText;
        const textArray = text.split("\n");
        const className = normalizeClassName(textArray[0]);
        const teacherNames = textArray[1];

        str += className + ", " + teacherNames + "\n";        
    });
    return str;
}

/**
 * @function normalizeClassName
 * @description 授業名を正規化する．(１Q)と(２Q), (３Q), (４Q)を削除する．全角英数字を半角英数字に変換する．
 * @param {string} str 授業名が含まれる文字列
 * @return {string} 授業名
 * 
 * @since 2024/06/08
 * @auther 小島佑太
 */
function normalizeClassName(className){
    //(１Q)と(２Q)を削除
    let ret = className.replace("(１Q)", "");
    ret = ret.replace("(２Q)", "");
    ret = ret.replace("(３Q)", "");
    ret = ret.replace("(４Q)", "");
    
    //全角英数字を半角英数字に変換
    ret = ret.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    

    return ret;
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



