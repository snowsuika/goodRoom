let reservationArr = JSON.parse(localStorage.getItem('bookingDate')) || [];
console.log(reservationArr);

let duringCheckinDate = '';



  $.datepicker.setDefaults({ dateFormat: 'yy-mm-dd' });
  $("#viewBookingStatus").datepicker({
       numberOfMonths: 2,
       minDate: "dateToday",
       maxDate: "+90d",
       dates: [null, null],
       dateFormat: 'yy-mm-dd',
       beforeShowDay: function (date) {
          //$("#start-date").val("2020-05-30");
         // $("#end-date").val("2020-05-31");
         let returnArr = [];
         let string = jQuery.datepicker.formatDate('yy-mm-dd', date);
         var date1 = $.datepicker.parseDate($.datepicker._defaults.dateFormat, $("#start-date").val());
         //Mon Jun 01 2020 00:00:00 GMT+0800 (台北標準時間)
         var date2 = $.datepicker.parseDate($.datepicker._defaults.dateFormat, $("#end-date").val());
  
         //ex: 2020-05-27 ~ 2020-05-29 這三天都會是true
       var isHightlight = date1 && ((date.getTime() == date1.getTime()) || (date2 && date >= date1 && date <= date2));
         if (reservationArr.indexOf(string) == -1) { //不是已經被選過的日期就是true(可選)
           returnArr = [true]
           if(isHightlight){//被選過的起始~結尾給樣式
             returnArr = [true,"dp-highlight"]
             if (date.getTime() == date1.getTime()) {
               returnArr = [true,"ui-state-chickin"]
             }
           }
           
         }else{
           returnArr.push(false) //都不是的話不能選
         }
         return returnArr
         
       },
  
  
  onSelect: function(dateText, inst) {
  //  console.log(dateText); //所選日期的文本，如06/10/2020
  //console.log(inst); //datepicker實體currentDay: "10",currentMonth: 5,currentYear: 2020..
  
  //  $.datepicker.formatDate("日期格式", 日期物件Date, 參數設定) 解析日期格式
  // console.log($.datepicker._defaults.dateFormat); //mm/dd/yy
  // console.log($("#start-date").val()); //06/10/2020
     var date1 = $.datepicker.parseDate($.datepicker._defaults.dateFormat, $("#start-date").val());
     //console.log(date1); //Mon Jun 01 2020 00:00:00 GMT+0800 (台北標準時間)
     
     var date2 = $.datepicker.parseDate($.datepicker._defaults.dateFormat, $("#end-date").val());
     // console.log(date2); null Mon Jun 01 2020 00:00:00 GMT+0800 (台北標準時間)
     
     var selectedDate = $.datepicker.parseDate($.datepicker._defaults.dateFormat, dateText);
    // console.log(selectedDate); //Wed Jun 17 2020 00:00:00 GMT+0800 (台北標準時間)
 
     if (date1 == null || date2) {
       // console.log("1");
       // console.log(date1);
       // console.log(date2);
         $("#start-date").val(dateText); //設定開始日期到$("#start-date")
         $("#end-date").val("");
         $('#checkinDate').val($("#start-date").val());
         $('#checkoutDate').val($("#end-date").val());
     } else if (selectedDate < date1) { //如果第二次點擊的日期小於第一次點擊的日期，
       // console.log("2");
       // console.log(date1);
       // console.log(date2);
         $("#end-date").val($("#start-date").val());
         $("#start-date").val(dateText); //那第二次點的日期當作開始日期，設定到$("#start-date")
 
         // document.getElementById('checkoutDate').value = document.getElementById('end-date').value
         $('#checkoutDate').val($("#end-date").val());
         $('#checkinDate').val($("#start-date").val());
 
         // console.log($("#end-date").val());
         // console.log($('#checkoutDate').val());
         
     } else {
         $("#end-date").val(dateText);//結束的日期是第二次點擊的日期
         $('#checkoutDate').val($("#end-date").val());
     }
  
 //  inst.settings.dates = [$("#start-date").val(),$("#end-date").val()]
 //  duringCheckinDate = inst.settings.dates
 //  document.getElementById('checkinDate').value = checkinData.checkin;
 //  document.getElementById('checkoutDate').value = checkinData.checkout;
 duringCheckinDate = [$("#start-date").val(),$("#end-date").val()]
  passCheckinData(duringCheckinDate);
  
  
  },
  
  });
  // //預設訂房日是今日～隔日
  // let today = $.datepicker.formatDate('yy-mm-dd', new Date());
  // let tomarrow = $.datepicker.formatDate('yy-mm-dd', new Date(new Date().setDate(new Date().getDate()+1)));
  //    $('#checkinDate').val(today);
  //    $('#checkoutDate').val(tomarrow);
  //    duringCheckinDate = [$('#checkinDate').val(),$('#checkoutDate').val()]
  //    passCheckinData(duringCheckinDate);
 
 
     
  $('#checkinDate').datepicker({
   minDate: "0d",
   maxDate: "+90d",
   dateFormat: 'yy-mm-dd',
   minDate: "dateToday",
   beforeShowDay: function (date) {
     let returnArr = [];
     let string = jQuery.datepicker.formatDate('yy-mm-dd', date);
     if (reservationArr.indexOf(string) == -1) { //不是已經被選過的日期就是true(可選)
       returnArr = [true]
     }else{
       returnArr.push(false) //都不是的話不能選
     }
     return returnArr
     
   },
   onSelect:(function (dateText,inst) {
     // console.log("入"+dateText);
     // console.log($('#checkinDate').val());
     // console.log($('#checkoutDate').val());
     
     $('#checkinDate').val(dateText)
 
     duringCheckinDate = [$('#checkinDate').val(),$('#checkoutDate').val()]
     //console.log(duringCheckinDate);
     passCheckinData(duringCheckinDate);
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
   minDate: "0d",
   maxDate: "+90d",
   dateFormat: 'yy-mm-dd',
   beforeShowDay: function (date) {
     let returnArr = [];
     let string = jQuery.datepicker.formatDate('yy-mm-dd', date);
     
     if (reservationArr.indexOf(string) == -1) { //不是已經被選過的日期就是true(可選)
       returnArr = [true]
     }else{
       returnArr.push(false) //都不是的話不能選
     }
     return returnArr
     
   },
   onSelect:(function(dateText, inst) {
 
     $('#checkoutDate').val(dateText)
 
     // console.log(inst);
     // console.log("出"+dateText);
     // console.log($('#checkinDate').val());
     // console.log($('#checkoutDate').val());
     duringCheckinDate = [$('#checkinDate').val(),$('#checkoutDate').val()]
     // console.log(duringCheckinDate);
     
     passCheckinData(duringCheckinDate);
 
   })
  });
  


 
 //console.log(getBetweenDate(start,end));
 
 $('#clearDates').on('click',function () {
   $.datepicker._clearDate('#viewBookingStatus');
 
  })
 
 