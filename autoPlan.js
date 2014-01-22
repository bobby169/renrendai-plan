seajs.use(['jquery'],function($){
  var n = 0;
  var $p = $('#plan-status-in-progress');
  var $plan = $('.ui-plan-latest').css({position:'relative'});
  $auto = $('<div></div>').css({position:'absolute',top:'0px',left:'0px',width:'100%',height:'30px',lineHeight:'30px',textAlign:'center',background:'red',color:'white'}).appendTo($plan);
  if($('.login-link').parents('.ui-nav').is(':visible')){
    $auto.html('未监控理财计划，您还未登录！');
    return;
  }else{
    $auto.html('理财计划自动投标监控中。。。');
  }
  var t = setInterval(function(){
    if(!$p.is(':visible')){
      clearInterval(t);
      post();
    }
  },500);
  function post(){
    var tt = setInterval(function(){
      $.ajax({
        url:'http://www.renrendai.com/financeplan/applyFinancePlan.action',
        type:'POST',
        data:{
          financePlanIdStr:53,
          cashTypeStr:'INVEST',
          amountStr:20000
        },
        success:function(data){
          var res = data.match(/<div .* data-message="(.*)" style/)[1];
          $auto.html(res);
/*          if(res == '此理财计划不在销售期'){
            clearInterval(tt);
          }*/
        }
      });
      n++;
      if(n >= 30) clearInterval(tt);
    },2000)
  }
});