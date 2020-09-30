let dateEle = document.querySelectorAll('#simpleDate');
dateEle.forEach((ele) => ele.innerText = getDetailedDate(ele.innerText))

function getDetailedDate(date) {
    let value = new Date(date);
    let day = value.getUTCDay();
    if (day != 0) {
        day = 'Thứ ' + (day+1)
    } else {
        day = 'Chủ nhật'
    }
    return `${date.slice(5,7)}/${date.slice(8,10)} ${day}`
    
}