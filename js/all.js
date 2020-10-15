//元件互動
//loading
let loadingMask = document.querySelector('.loadingMask');
function completeLoading() {
  loadingMask.style.opacity = '0';
  loadingMask.style.display = 'none';
}
function showLoading() {
  loadingMask.style.opacity = '1';
}

let path = window.location.pathname;
//取 資料 -index.html 不同頁面跑不同function
function getHouseData() {
  let url = 'https://challenge.thef2e.com/api/thef2e2019/stage6/rooms'
  fetch(url, {
      method: 'get',
      headers: {
        'Authorization': 'Bearer W3hfQ08pfWdDopcGNYaj2V4ekt6toFHAqNLOJhPjjm8Ce9ldqfwOc7yTQYRP',
        'Content-Type': 'application/json; charset=utf-8'
      },
    })
    .then(function (res) {
      return res.json();
    })
    .then(function (JSONData) {
      let houseDateLen = JSONData.items.length;
      let hostelData = [];
      for (let i = 0; i < houseDateLen; i++) {
        hostelData.push(JSONData.items[i])
      }
      if (path == '/index.html') {
        showLoading()
        printGalleryPhoto(hostelData);
        let carouselImgUrls = ['images/housePhoto/housePhoto_1.jpeg', 'images/housePhoto/housePhoto_2.jpeg', 'images/housePhoto/housePhoto_3.jpeg', 'images/housePhoto/housePhoto_4.jpeg'];
        createCarouselDOM(carouselImgUrls)
        showCarousel() //背景輪播
        
      } else if (path == '/room.html') {
        let roomId = window.localStorage.getItem('roomId');
        getRoomData(JSON.parse(roomId))
      }
    })
}
getHouseData()
// 取 房間資料 - room.html
function getRoomData(roomId) {
  let url = 'https://challenge.thef2e.com/api/thef2e2019/stage6/room/' + roomId;
  fetch(url, {
      method: 'get',
      headers: {
        'Authorization': 'Bearer W3hfQ08pfWdDopcGNYaj2V4ekt6toFHAqNLOJhPjjm8Ce9ldqfwOc7yTQYRP',
        'Content-Type': 'application/json; charset=utf-8'
      },
    })
    .then(function (res) {
      return res.json();
    })
    .then(function (JSONData) {
      let roomData = JSONData.room[0] //房間內資料
      let bookingData = JSONData.booking //該房間的訂房資料
      let roomPrice = {
        normalDayPrice: roomData.normalDayPrice, // 房間平日價格
        holidayPrice: roomData.holidayPrice,// 房間假日價格
      }
      //取得所有已經被預訂日期的陣列
      let alreadyBookingArray = []
      for (let i = 0; i < bookingData.length; i++) {
        alreadyBookingArray.push(bookingData[i].date)
      }
      let duringCheckinDate = '';
      $.datepicker.setDefaults({
        dateFormat: 'yy-mm-dd'
      });

      //預設訂房日是今日～隔日
      let today = new Date();
      let tomarrow = ChangeDateFormat_yymmdd(new Date(today.setDate(today.getDate()+1)))
      let acquired = ChangeDateFormat_yymmdd(new Date(today.setDate(today.getDate()+2)))

      $('#checkinDate').val(tomarrow);
      $('#checkoutDate').val(acquired);
      $("#start-date").val(tomarrow)
      $("#end-date").val(acquired);

      duringCheckinDate = [$('#checkinDate').val(), tomarrow]
      passCheckinData(duringCheckinDate,alreadyBookingArray,roomPrice);

      $("#viewBookingStatus").datepicker({
        numberOfMonths: 2,
        minDate: "+1d",
        maxDate: "+90d",
        dates: [null, null],
        dateFormat: 'yy-mm-dd',
        beforeShowDay: function (date) {
          let returnArr = [];
          let string = jQuery.datepicker.formatDate('yy-mm-dd', date);
          var date1 = $.datepicker.parseDate($.datepicker._defaults.dateFormat, $("#start-date").val());
          var date2 = $.datepicker.parseDate($.datepicker._defaults.dateFormat, $("#end-date").val());
          var isHightlight = date1 && ((date.getTime() == date1.getTime()) || (date2 && date >= date1 && date <= date2));
          if (alreadyBookingArray.indexOf(string) == -1) { //不是已經被選過的日期就是true(可選)
            returnArr = [true]
            if (isHightlight) { //被選過的起始~結尾給樣式
              returnArr = [true, "ui-datepicker-highlight"]
              if (date.getTime() == date1.getTime()) {
                returnArr = [true, "ui-datepicker-highlight ui-state-chickin"]
              } else if (date.getTime() == date2.getTime()) {
                returnArr = [true, "ui-datepicker-highlight ui-state-chickout"]
              }
            }

          } else {
            returnArr.push(false) //都不是的話不能選
          }
          return returnArr
        },
        onSelect: function (dateText, inst) {
          let date1 = $.datepicker.parseDate($.datepicker._defaults.dateFormat, $("#start-date").val());
          let date2 = $.datepicker.parseDate($.datepicker._defaults.dateFormat, $("#end-date").val());
          let selectedDate = $.datepicker.parseDate($.datepicker._defaults.dateFormat, dateText);
          if (date1 == null || date2) {
            $("#start-date").val(dateText); //設定開始日期到$("#start-date")
            $("#end-date").val("");
            $('#checkinDate').val($("#start-date").val());
            $('#checkoutDate').val($("#end-date").val());
          } else if (selectedDate < date1) { //如果第二次點擊的日期小於第一次點擊的日期，
            $("#end-date").val($("#start-date").val());
            $("#start-date").val(dateText); //那第二次點的日期當作開始日期，設定到$("#start-date")
            $('#checkoutDate').val($("#end-date").val());
            $('#checkinDate').val($("#start-date").val());
          } else {
            $("#end-date").val(dateText); //結束的日期是第二次點擊的日期
            $('#checkoutDate').val($("#end-date").val());
          }
          duringCheckinDate = [$("#start-date").val(), $("#end-date").val()]
          passCheckinData(duringCheckinDate,alreadyBookingArray,roomPrice);
        },
      });
      $('#checkinDate').datepicker({
        minDate: "+1d",
        maxDate: "+90d",
        dateFormat: 'yy-mm-dd',
        beforeShowDay: function (date) {
          let returnArr = [];
          let string = jQuery.datepicker.formatDate('yy-mm-dd', date);
          if (alreadyBookingArray.indexOf(string) == -1) { //不是已經被選過的日期就是true(可選)
            returnArr = [true]
          } else {
            returnArr.push(false) //都不是的話不能選
          }
          return returnArr
        },
        onSelect: (function (dateText, inst) {
          $('#checkinDate').val(dateText)
          duringCheckinDate = [$('#checkinDate').val(), $('#checkoutDate').val()]
          passCheckinData(duringCheckinDate,alreadyBookingArray,roomPrice);

        }),
        //   onClose: function (selectedDate) {
        //     let selectCheckin = new Date(selectedDate);
        //     let selectTomarrow = new Date(selectCheckin.setDate(selectCheckin.getDate()+1))
        //     let selectTomarrorChangeFormat =  $.datepicker.formatDate('yy-mm-dd',selectTomarrow);
        //     $('#checkoutDate').val(selectTomarrorChangeFormat);
        //     duringCheckinDate = [$('#checkinDate').val(),$('#checkoutDate').val()]
        // }
      });
      $('#checkoutDate').datepicker({
        minDate: "+1d",
        maxDate: "+90d",
        dateFormat: 'yy-mm-dd',
        beforeShowDay: function (date) {
          let returnArr = [];
          let string = jQuery.datepicker.formatDate('yy-mm-dd', date);

          if (alreadyBookingArray.indexOf(string) == -1) { //不是已經被選過的日期就是true(可選)
            returnArr = [true]
          } else {
            returnArr.push(false) //都不是的話不能選
          }
          return returnArr

        },
        onSelect: (function (dateText, inst) {
          $('#checkoutDate').val(dateText)
          duringCheckinDate = [$('#checkinDate').val(), $('#checkoutDate').val()]
          passCheckinData(duringCheckinDate,alreadyBookingArray,roomPrice);


        })
      });

      document.getElementById('viewOtherRoomLink').onclick = function (e) {
        e.preventDefault();
        localStorage.clear()
        window.location.href = 'index.html'
      }

      //撈完房間資料後，監聽是否有按下送出訂房按鈕
      let submitBookingBtn = document.getElementById('submitBooking');
      submitBookingBtn.addEventListener('click', function (e) {
        //確認送出的格式是否符合規定
        let checkFormat = checkBookingFormat()
        if (checkFormat !== true) {
          return
        } else {
          let roomId = JSON.parse(localStorage.getItem('roomId'));
          addBookingData(roomId)
        }
      }, false)

      printRoom(roomData);
      completeLoading()
    })
}

//做 資料 checkin、checkout的區間、平日假日天數
function passCheckinData(duringCheckinDate,alreadyBookingArray,roomPrice) {
  let checkFormatMsg = document.querySelectorAll('.p-bookingModal__checkinInput .m-inputColumn__checkFormat')
  checkFormatMsg.forEach(function (element) {
    element.style.display = 'none'
  })

  let checkoutDate = document.getElementById('checkoutDate')
  let errorDOM = document.createElement('span')
  errorDOM.setAttribute('class', 'm-inputColumn__checkFormat');
  errorDOM.innerText = '退房時間不得小於入住時間';

  //做資料前確認有起訖、開始時間大於結束時間
  let startDay = new Date(duringCheckinDate[0]).getTime()
  let endDay = new Date(duringCheckinDate[1]).getTime()
  if (duringCheckinDate[0] == "" || duringCheckinDate[1] == "") {
    return
  } else if (startDay > endDay) {
    checkoutDate.parentNode.insertBefore(errorDOM, checkoutDate.nextSibling)

  }
  let checkinBetweenDate = getBetweenDate(duringCheckinDate)

  //最後一天就退房了，所以最後一天不算
 checkinBetweenDate.splice((checkinBetweenDate.length-1),1)

  //判斷平日與假日的天數
  let normalWeekDay = judgeWeekendDays(checkinBetweenDate)
  let userCheckinObj = {
    checkin: duringCheckinDate[0],
    checkout: duringCheckinDate[1],
    checkinBetweenDate: checkinBetweenDate,
    normalDays: normalWeekDay[0],
    weekDays: normalWeekDay[1]
  }


  localStorage.setItem('userCheckinObj', JSON.stringify(userCheckinObj))
  //一更動到日曆，更新訂房時會需要的日曆資訊，並即時更新價格到room頁面、modal頁面上
  printCheckinPrice(userCheckinObj,roomPrice);
}

// 新增 資料 - room.html
function addBookingData(roomId) {
  let url = 'https://challenge.thef2e.com/api/thef2e2019/stage6/room/' + roomId;
  let bookingRangeDate = JSON.parse(localStorage.getItem('userCheckinObj')).checkinBetweenDate;

  let bookingUserName = document.getElementById('bookingName').value;
  let bookingUserTEL = document.getElementById('bookingTEL').value;
  let bookingDate = bookingRangeDate;
  let sendBookingObj = {
    "name": bookingUserName,
    "tel": bookingUserTEL,
    "date": bookingDate
  }

  fetch(url, {
    method: 'post',
    headers: {
      'Authorization': 'Bearer W3hfQ08pfWdDopcGNYaj2V4ekt6toFHAqNLOJhPjjm8Ce9ldqfwOc7yTQYRP',
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(sendBookingObj)
  }).then(function (res) {
    return res.json();
  }).then(function (jsonData) {
    console.log(jsonData)
    let bookingResult = '';
    if (jsonData.success == true) {
      bookingResult = "success";
      printSuccessFail(bookingResult)
    }else{
      console.log(jsonData.message)
      bookingResult = "fail";
      printSuccessFail(bookingResult)
    }
  }).catch(function (err) {
    console.log(err);

  })
}

//渲染成功預定、失敗預定畫面
function printSuccessFail(result) {
  let bookingResult = result;
  let bookingResultModal = document.querySelector('.p-bookingResult');
    document.querySelector('.p-bookingModal').style.display = 'none';
    bookingResultModal.style.display = 'flex';
    if (bookingResult == "fail") {
      bookingResultModal.innerHTML = `
      <img src="/images/icon/icon_booking_fail.svg" alt="">
				<div class="p-bookingResult__resultText">
        預約失敗
				</div>
				<div class="p-bookingResult__description">
        哎呀！晚了一步！您預約的日期已經被預約走了， 再看看其它房型吧
				</div>
      `;
    }
      setTimeout(() => {
      window.location.reload("/room.html")
    }, 3000);
}


//渲染畫面 index.html
function printGalleryPhoto(hostelData) {
  let hostelDataLen = hostelData.length;
  let gallery = document.querySelector('.p-gallery');
  let galleryItemList = '';
  for (let i = 0; i < hostelDataLen; i++) {
    galleryItemList += `
  <li class="p-gallery__item">
    <a href="page.html" class="p-gallery__item__photo" style="background-image:url(${hostelData[i].imageUrl})">
    <div data-roomsn="${i}" class="p-gallery__item__roomName">${hostelData[i].name}</div>
    </a>
    </li>
  `
  }
  gallery.innerHTML = galleryItemList
  completeLoading()
  let galleryDOM = document.querySelector('.p-gallery')
        galleryDOM.addEventListener('click', function (e) {
          e.stopPropagation();
          e.preventDefault();
          let roomSN = e.target.dataset.roomsn;
          window.location.href = 'room.html'
          window.localStorage.setItem('roomId', JSON.stringify(hostelData[roomSN].id))
        }, false)
}

//渲染畫面 room.html
function printRoom(roomData) {
let bedSizeData = roomData.descriptionShort.Bed;
let bedSize = bedTranslationChinese(bedSizeData)

  let roomPriceFormat = toCurrency(roomData.normalDayPrice)
  document.querySelector('.p-room-bookAction__box__price').innerHTML = `<p>$${roomPriceFormat}</p>
  <span>/ 1晚</span>
  `
  document.querySelector('.p-room__content__title__name').innerText = roomData.name;
  document.querySelector('.p-room__content__title__spec').innerHTML = `
  ${roomData.descriptionShort.GuestMin}-${roomData.descriptionShort.GuestMax}人・ ${bedSize}・ 附早餐・衛浴${roomData.descriptionShort["Private-Bath"]}間・${roomData.descriptionShort.Footage}平方公尺
  `
  document.querySelector('.p-room__content__opentimePrice').innerHTML = `
    <p>平日（一～四）價格：${roomData.normalDayPrice} / 假日（五〜日）價格：${roomData.holidayPrice} </p>
    <p>入住時間：${roomData.checkInAndOut.checkInEarly}（最早）/ ${roomData.checkInAndOut.checkInLate}（最晚）</p>
    <p>退房時間：${roomData.checkInAndOut.checkOut}</p>
  `;
  document.querySelector('.p-room__content__checkinInfo').innerHTML = `
    ${roomData.description}
  `
 //渲染icon
 let amenitiesList = document.querySelector('.p-room__content__amenities .m-amenities__list');
 PrintAmenitiesIcon(amenitiesList, roomData)

//房間內輪播
  let carouselImgUrls = roomData.imageUrl;
  for (let i = 0; i < carouselImgUrls.length; i++) {
    let roomCarouselImg = document.createElement('div');
    roomCarouselImg.setAttribute('class', 'm-carousel__bg fade');
    roomCarouselImg.setAttribute('data-roomPhoto', i);
    roomCarouselImg.style.backgroundImage = `linear-gradient(180deg, rgba(255, 255, 255, 0)0%, rgba(255, 255, 255, .6)50%),url("${carouselImgUrls[i]}")`
    document.querySelector('.m-carousel').appendChild(roomCarouselImg)
  }
  showCarousel();

//點擊房間輪播背景觸發幻燈片
  document.querySelector('.m-carousel').addEventListener('click', function (e) {
    if (e.target.classList.contains('m-carousel__bg')) {
    //顯示幻燈片
      document.querySelector('.m-slidesLightbox').classList.remove('hide')
      document.querySelector('.m-slidesLightbox__container__close').onclick = function () {
        document.querySelector('.m-slidesLightbox').classList.add('hide')
      }
      for (let i = 0; i < carouselImgUrls.length; i++) {
        let roomSlidesLightImg = document.createElement('div');
        roomSlidesLightImg.setAttribute('class', 'm-slidesLightbox__container__photo');
        roomSlidesLightImg.style.backgroundImage = `url("${carouselImgUrls[i]}")`
        document.querySelector('.m-slidesLightbox__container').appendChild(roomSlidesLightImg)
      }
      slidesLightbox();
      document.querySelector('.m-slidesLightbox__container__prev').onclick = function (e) {
        plusSlides()
      }
      document.querySelector('.m-slidesLightbox__container__next').onclick = function (e) {
        nextSlides()
      }

    } else {
      return
    }

  }, false)

  //modal show、hide
  document.querySelector('.p-room-bookAction__box__Btn').onclick = function () {
    document.querySelector('.m-modal').classList.add('show')
  }
  document.querySelector('.m-modal__wrap__content__close').onclick = function () {
    document.querySelector('.m-modal').classList.remove('show')

  }

  //渲染modal裡面的資料
  document.querySelector('.p-bookingModal__checkinInput__total__liveDays').innerHTML = `
  2天，1晚平日
  `
  document.querySelector('.p-bookingModal__checkinInput__total__totalPrice').innerHTML = `
  <span>總計</span> $${roomData.normalDayPrice}
`

  document.querySelector('.p-bookingModal__checkinInfo__descriptionShort').innerHTML = `
            <h2>${roomData.name}</h2>
							<p>${roomData.descriptionShort.GuestMin}-${roomData.descriptionShort.GuestMax}人・ ${bedSize}・附早餐・ 衛浴${roomData.descriptionShort["Private-Bath"]}間・${roomData.descriptionShort.Footage}平方公尺 </p>
							<p>平日（一～四）價格：${roomData.normalDayPrice} / 假日（五〜日）價格：${roomData.holidayPrice}</p>
							</div>
`
  //渲染modal icon
  let modalAmenitiesList = document.querySelector('.p-bookingModal__checkinInfo__amenities .m-amenities__list')
  PrintAmenitiesIcon(modalAmenitiesList, roomData)

}


//渲染畫面 room.html 渲染icon
function PrintAmenitiesIcon(DOM, roomData) {
  let amenitiesIconObj = roomData.amenities;
  let amenitiesIconObjKeys = Object.keys(roomData.amenities);
  let amenitiesTempArr = []
  let amenitiesStr = ''
  let parentNodeClass = DOM.parentNode.className;
  amenitiesIconObjKeys.forEach(function (key, index) {
    let engStr = amenitiesIconObjKeys[index];
    let amenitiesChineseText = translationChinese(engStr)
    let className = ''
    if (amenitiesIconObj[key] === true) {
      className = '--isProvided'
    } else if (parentNodeClass == 'p-bookingModal__checkinInfo__amenities') {
      className = 'hide'
    }
    amenitiesStr = `
      <li class="m-amenities__list__item ${className}">
      <img src="images/icon/icon_amenities_${amenitiesIconObjKeys[index]}.svg" alt="">
      <p>${amenitiesChineseText}</p>
    </li>
    `
    amenitiesTempArr.push(amenitiesStr);
  })
  let amenitiesTemp = amenitiesTempArr.join('')
  DOM.innerHTML = amenitiesTemp
}

//渲染畫面 room.html 選擇日期後 更新渲染
function printCheckinPrice(userCheckinObj,roomPrice) {
  // room頁面上
  let normalDayPrice = roomPrice.normalDayPrice
  let holidayPrice = roomPrice.holidayPrice
  let totalPrice = toCurrency((userCheckinObj.normalDays * normalDayPrice) + (userCheckinObj.weekDays * holidayPrice));

  document.querySelector('.p-room-bookAction__box__price').innerHTML = `
    <p>$${totalPrice}</p>
    <span>/ ${userCheckinObj.checkinBetweenDate.length}晚</span>
  `
  //同步更新modal畫面
  printDataToBookingModal(userCheckinObj, totalPrice)

}
//渲染畫面 room.html 把訂房資料show到modal上
function printDataToBookingModal(userCheckinObj, totalPrice) {
  document.querySelector('.p-bookingModal__checkinInput__total__liveDays').innerHTML = `
   ${userCheckinObj.checkinBetweenDate.length}天，${userCheckinObj.normalDays}晚平日，${userCheckinObj.weekDays}晚假日
   `
  document.querySelector('.p-bookingModal__checkinInput__total__totalPrice').innerHTML = `
   <span>總計</span> $${totalPrice}
   `
}

//效果類 輪播
let slideIndex = 0;
function showCarousel() {
  let slides = document.querySelectorAll(".m-carousel__bg");
  let dots = document.querySelectorAll(".m-carousel__carouselCircle__dot");
  for (let i = 0; i < slides.length; i++) {
    slides[i].classList.add('hide')
  }

  //判斷當圖片循環到大於總圖片數目  序列又變回0 重新來過
  if (slideIndex > slides.length -1) {
    slideIndex = 0;
  }
  if (slideIndex < 0) {
    slideIndex = 0;
  }
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove('--isActive')
  }

  slides[slideIndex].classList.remove('hide')
  dots[slideIndex].classList.add('--isActive')
  setTimeout(showCarousel, 4000);
  slideIndex++;
}

//效果類 燈箱
let slidesLightboxNum = 0;
function slidesLightbox() {
  var slidesLightboxDOM = document.getElementsByClassName("m-slidesLightbox__container__photo");
  if (slidesLightboxNum > slidesLightboxDOM.length - 1) {
    slidesLightboxNum = 0
  }
  if (slidesLightboxNum < 0) {
    slidesLightboxNum = slidesLightboxDOM.length - 1
  }

  for (let i = 0; i < slidesLightboxDOM.length; i++) {
    slidesLightboxDOM[i].style.display = "none";
  }

  slidesLightboxDOM[slidesLightboxNum].style.display = "block";

}
function plusSlides() {
  slidesLightboxNum = slidesLightboxNum - 1
  slidesLightbox(slidesLightboxNum);
}
function nextSlides() {
  slidesLightboxNum = slidesLightboxNum + 1
  slidesLightbox(slidesLightboxNum);
}

//工具類 產出輪播背景DOM
function createCarouselDOM(carouselImgUrls) {
  for (let i = 0; i < carouselImgUrls.length; i++) {
    let carouselImg = document.createElement('div');
    carouselImg.setAttribute('class', 'm-carousel__bg fade');
    carouselImg.setAttribute('data-roomPhoto', i);
    carouselImg.style.backgroundImage = `url(${carouselImgUrls[i]})`
    document.querySelector('.m-carousel').appendChild(carouselImg)
  }
}

//工具類 檢核送出訂房格式是否正確
function checkBookingFormat() {
  let errorDOM = document.createElement('span');
  errorDOM.setAttribute('class', 'm-inputColumn__checkFormat');
  let checkFormatMsg = document.querySelectorAll('.p-bookingModal__checkinInput .m-inputColumn__checkFormat')
  checkFormatMsg.forEach(function (element) {
    element.style.display = 'none'
  })

  let bookingName = document.getElementById('bookingName');
  let bookingTEL = document.getElementById('bookingTEL');
  let checkinDate = document.getElementById('checkinDate');
  let checkoutDate = document.getElementById('checkoutDate');


  if (bookingName.value.search(/^[\u4e00-\u9fa5]+$|^[a-zA-Z\s]+$/) == -1) {
    errorDOM.style.display = 'block'
    errorDOM.innerText = '姓名格式有誤';
    bookingName.parentNode.insertBefore(errorDOM, bookingName.nextSibling)
    return false

  } else if (bookingTEL.value.search(/^09[0-9]{8}$/) == -1) {
    errorDOM.style.display = 'block'
    errorDOM.innerText = '手機格式有誤';
    bookingTEL.parentNode.insertBefore(errorDOM, bookingTEL.nextSibling)
    return false
  } else if (checkinDate.value == '') {
    errorDOM.innerText = '請選擇欲入住日期';
    checkinDate.parentNode.insertBefore(errorDOM, checkinDate.nextSibling)
    return false
  } else if (checkoutDate.value == '') {
    errorDOM.innerText = '請選擇退房日期';
    checkoutDate.parentNode.insertBefore(errorDOM, checkoutDate.nextSibling)
    return false
  } else if (new Date(checkinDate.value) > new Date(checkoutDate.value)) {
    errorDOM.innerText = '退房時間不得小於入住時間';
    checkoutDate.parentNode.insertBefore(errorDOM, checkoutDate.nextSibling)
    return false
  } else {
    return true
  }
}

//工具類 計算兩個日期間所有日期
function getBetweenDate(duringCheckinDate) {

  let startDate = new Date(duringCheckinDate[0])
  let endDate = new Date(duringCheckinDate[1])

  let checkinBetween = []
  while ((endDate.getTime() - startDate.getTime()) >= 0) {
    let year = startDate.getFullYear();
    let month = (startDate.getMonth() + 1).toString().length == 1 ? "0" + (startDate.getMonth() + 1).toString() : (startDate.getMonth() + 1);
    let day = startDate.getDate().toString().length == 1 ? "0" + startDate.getDate() : startDate.getDate();
    checkinBetween.push(year + "-" + month + "-" + day)
    startDate.setDate(startDate.getDate() + 1);
  }
  return checkinBetween
}

//工具類 判斷週末/平日有幾天
function judgeWeekendDays(checkinBetweenDate) {
  let normalDay = 0;
  let weekNum = 0;
  checkinBetweenDate.forEach(element => {
    switch (new Date(element).getDay()) {
      case 0:
        weekNum = weekNum + 1;
        break;
        case 5:
          weekNum = weekNum + 1;
          break;
      case 6:
        weekNum = weekNum + 1;
        break;
      default:
        normalDay = normalDay + 1;
        break;
    }
  });

  return [normalDay, weekNum]

}

//工具類 英文轉中文
function translationChinese(engStr) {
  let chineseObj = {
    "Wi-Fi": "Wi-Fi",
    "Breakfast": "早餐",
    "Mini-Bar": "Mini-Bar",
    "Room-Service": "客房服務",
    "Television": "電話",
    "Air-Conditioner": "空調",
    "Refrigerator": "冰箱",
    "Sofa": "沙發",
    "Great-View": "漂亮的視野",
    "Smoke-Free": "全面禁菸",
    "Child-Friendly": "適合兒童",
    "Pet-Friendly": "攜帶寵物"
  }
  let chineseStr = ''
  Object.keys(chineseObj).forEach(function (element) {
    if (engStr == element) {
      chineseStr = chineseObj[element]
    }
  })
  return chineseStr
}
function bedTranslationChinese(bedSizeData) {

  let chineseStr = [];
  if(bedSizeData.length == 2){
    chineseStr.push("兩張");
  }
    let chineseObj = {
    "Single": "單人床",
    "Small Double": "小雙人床",
    "Double":"雙人床",
    "Queen":"大雙人床"
  }

  Object.keys(chineseObj).forEach(function (element) { 
    if(bedSizeData[0] == element){
      chineseStr.push(chineseObj[element])
    }
   })

   return chineseStr.join('')
}

//工具類 金額加千分位
function toCurrency(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

//工具類 轉換成yy-mm-dd格式
function ChangeDateFormat_yymmdd(passDate) {

  let year = passDate.getFullYear();
  let month = passDate.getMonth() + 1;
  let date = passDate.getDate();

  return [year, month > 9 ? month : "0" + month, date > 9 ? date : "0" + date].join('-')
}