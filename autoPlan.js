seajs.use(['jquery', 'dialog'], function ($, Dialog) {
  var n = 1,
    $p = $('#plan-status-in-progress'),
    id = $p.find('.ui-progressbar-circle').attr('href').match(/\d+/)[0],
    $plan = $('.ui-plan-latest').css({position: 'relative'}),
    local = {amountStr: 10000, cashTypeStr: 'INVEST'},
    promise = "",
    $setAuto = $('<a style="cursor:pointer;color: #fff;margin-left: 30px" id="setAuto">（设置）</a>'),
    $msg = $('<span></span>'),
    $auto = $('<div></div>').css({position: 'absolute', top: '0px', left: '0px', width: '100%', height: '30px', lineHeight: '30px', textAlign: 'center', background: 'red', color: 'white',boxShadow:'1px 1px 2px #000'}).appendTo($plan).append($msg).append($setAuto);


  function initNotif(){
    if(window.Notification){
      Notification.requestPermission();
    }
  }

  function notif(msg){
    if(!window.Notification){
      return;
    }
    if(window.Notification.permission == "granted"){
      var notification = new Notification("理财计划自动投标提示：", {
        dir: "auto",
        tag: "testTag",
        icon: "/static/img/notifi/LOAN_OPEN_TIMEOUT.png",
        body: msg
      });
    }else{
      window.Notification.requestPermission();
    }

  }

  if ($('.login-link').parents('.ui-nav').is(':visible')) {
    $auto.html('未监控理财计划，您还未登录！<a href="/loginPage.action?returnUrl=/">立即登录</a>');
    return;
  } else {
    $msg.html('理财计划自动投标监控中。。。');
  }

  var cookie = getParam(readCookie('mei'));
  var $form = $('<form class="ui-form" style="padding: 25px 40px"><div style="margin-left: -90px"><p class="ui-form-item" style="font-size: 16px">理财计划自动投标设置</p><div class="ui-form-item"><label class="ui-label">投标金额:</label><input class="ui-input" name="amountStr" placeholder="须为10,000元的整数倍" value="10000"/>元</div><div class="ui-form-item"><label class="ui-label">收益处理</label><input type="radio" name="cashTypeStr" value="INVEST" checked="checked">收益再投资<input type="radio" name="cashTypeStr" value="RRD" style="margin-left: 25px">提至账户</div><div class="ui-form-item"><input id="savebt" type="submit" class="ui-button ui-button-green ui-button-mid" value="保 存"></div></div></form>');

  var dialog = new Dialog({
    trigger: '#setAuto',
    width: '400px'
  }).before('show',function () {
      var cookie = getParam(readCookie('mei'));
      if (cookie.amountStr) {
        $form.find('input[name="amountStr"]').val(cookie.amountStr).end().find('input[name="cashTypeStr"]').filter(function () {
          {
            return this.value == cookie.cashTypeStr;
          }
        }).click();
      }

      this.set('content', $form);
      initNotif();
    });

  $form.submit(function (e) {
    var s = $(this).serializeArray();
    local.amountStr = s[0].value;
    local.cashTypeStr = s[1].value;
    dialog.hide();
    start();
    writeCookie('mei', $(this).serialize(), 24 * 360);
    e.preventDefault();
  });

  if (!cookie.amountStr) {
    dialog.show();
  } else {
    local = cookie;
    start();
  }

  function start() {
    var t = setInterval(function () {
      if ($p.is(':visible')) {
        clearInterval(t);
        post();
      }
    }, 100);
  }

  function post() {
    $msg.html('正在进行投标操作...尝试投标' + n + '次');
    $.ajax({
      url: '/financeplan/applyFinancePlan.action',
      type: 'POST',
      data: {
        financePlanIdStr: id,
        amountStr: local.amountStr || 10000,
        cashTypeStr: local.cashTypeStr || 'INVEST'
      },
      success: function (data) {
        var res = $.trim(data.match(/<div .* data-message="(.*)" style/)[1]);
        $msg.html(res);
        notif(res);
        if (res == '理财计划申请成功！' || res == '追加额度成功！' || res == '账户余额不足，请先充值。' || n >= 30) {
          return;
        }
        setTimeout(function () {
          post();
        }, 1000);
      }
    });
    n++;
  }

  function writeCookie(name, value, hours) {
    var expire = "";
    if (hours !== null) {
      expire = new Date((new Date()).getTime() + hours * 3600000);
      expire = "; expires=" + expire.toGMTString();
    }
    document.cookie = name + "=" + escape(value) + expire;
  }

  function readCookie(name) {
    var cookieValue = "";
    var search = name + "=";
    if (document.cookie.length > 0) {
      offset = document.cookie.indexOf(search);
      if (offset != -1) {
        offset += search.length;
        end = document.cookie.indexOf(";", offset);
        if (end == -1) end = document.cookie.length;
        cookieValue = unescape(document.cookie.substring(offset, end));
      }
    }
    return cookieValue;
  }

  function getParam(param) {
    var obj = {};
    if (!param) return obj;
    var arr = param.split('&');
    for (var i = 0; i < arr.length; i++) {
      var a = arr[i].split("=");
      obj[a[0]] = a[1];
    }
    return obj;
  }

});