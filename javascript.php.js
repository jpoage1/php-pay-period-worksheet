window.salon_id = '';
window.stylist_id = '';
window.pp_date = '';
window.onload = function() {
    if ( document.getElementById("fetch_ppw_button") )
        document.getElementById("fetch_ppw_button").innerHTML = "<input type=\"button\" value=\"Send\" onclick=\"return sendData()\"/>";
    if ( document.getElementById("save_pp_button") )
        document.getElementById("save_pp_button").innerHTML = "<input type=\"button\" value=\"Save\" id=\"save_pp_text\" onclick=\"return savePP()\"/>";
    if ( document.getElementById("login_button") )
        document.getElementById("login_button").innerHTML = "<input type=\"button\" value=\"Login\" onclick=\"return loginUser()\"/>";
   // startSession();
}
$( function() {
  $( "#pp_date_calendar" ).datepicker();
} );
function startSession() {
    uri = "index.php?action=fetch&fetch=session";
    method = "GET";
    return ajaxRequest(uri, method, function(xmlhttp) {
        statusText = '';
        userdata = JSON.parse(xmlhttp.responseText);
        if ( document.getElementById("stylist_id") && userdata['user_id'] && userdata['user_id'] != 0 )
        {
            document.getElementById("stylist_id").disabled = "disabled";
            document.getElementById("stylist_id").value = userdata['user_id'];
            showPayPeriods(userdata['user_id']);
        }
        if ( document.getElementById("logout_button") ) document.getElementById("logout_button").innerHTML = "<a href=\"index.php?action=logout\">Logout</a>";
    });
}
function loginUser() {
    uri = "index.php?action=login";
    method = "POST";
    postdata = "action=login&user_name="+document.getElementById('user_name').value+
                 "&user_pass="+document.getElementById('user_pass').value+
                 "&remember="+document.getElementById('remember').value;
    return ajaxRequest( uri, method, function() {
        statusText = '';
        userdata = JSON.parse(xmlhttp.responseText);
        if ( document.getElementById("stylist_id") && userdata['user_id'] && userdata['user_id'] != 0 )
        {
            document.getElementById("stylist_id").disabled = "disabled";
            document.getElementById("stylist_id").value = userdata['user_id'];
            showPayPeriods(userdata['user_id']);
        }
    }, postdata);
}

function dropMenu(label, token, token_name, token_id, match_token, set_id, fetch)
{
    if ( set_id == true )
    {
        eval('window.'+match_token+' = "'+token_id+'"');
    }
    uri = "index.php?action=fetch&fetch="+fetch+"&salon_id="+window.salon_id+"&stylist_id="+window.stylist_id+(token == 'pp_date' ? '' : "&pp_date="+window.pp_date);
    method = "GET";
    return ajaxRequest(uri, method, function(xmlhttp) {
        data = JSON.parse(xmlhttp.responseText);
        options = "<option value=\"0\">"+label+"</option>";
        keepValue = false;
        eval('tk1 = window.'+token)
        data.map(function(v,i) {
            eval('tk2 = data['+i+'][\''+token+'\']')
            selectedOption = tk1 == tk2 ? " selected=\"selected\"" : '';
            if ( selectedOption != '' )
            {
                keepValue = true;
            }
            eval('token_value = data['+i+'][\''+token+'\']')
            eval('token_label = data['+i+'][\''+token_name+'\']')
            options+= "<option value=\""+token_value+"\""+selectedOption+">"+token_label+"</option>";
        });
        if ( !keepValue ) eval('window.'+token+' = 0');
        if ( document.getElementsByName( 'pp_date_radio')[0] ) eval('document.getElementById(\''+token+'_menu\').innerHTML = options');
        else eval('document.getElementById(\''+token+'\').innerHTML = options');
    });
}
// Set worksheet data
// Select a stylist by id and show the pay periods
function showPayPeriods(stylist_id, set_id) {
    dropMenu("Select Pay Date", 'pp_date', 'pp_date', stylist_id, 'stylist_id', set_id, 'pay_periods')
    fetchWorkSheet()
}
function showStylists(salon_id, set_id) {
    dropMenu("Select a Stylist", 'stylist_id', 'stylist_name', salon_id, 'salon_id', set_id, 'stylists');
    showPayPeriods(window.stylist_id, false)
    fetchWorkSheet()
}
function setPayPeriod(pp_date) {
    window.pp_date = pp_date;
    fetchWorkSheet()
}
function fetchWorkSheet() {
    uri = "index.php?action=fetch&fetch=ppw&salon_id="+document.getElementById('salon_id').value+
                 "&stylist_id="+document.getElementById('stylist_id').value+
                 "&pp_date="+window.pp_date;
    method = "GET";
    return ajaxRequest(uri, method, function(xmlhttp) {
        if ( document.getElementById("ppw") ) document.getElementById("ppw").innerHTML = xmlhttp.responseText;
        window.pp_date = document.getElementById("pp_date_radio") ? getPPDate() : window.pp_date;
    });
}
function getPPDate() {
    return elementIsValue("pp_date_radio", "value", "DropMenu") ? document.getElementById('pp_date_menu').value :
            elementIsValue("pp_date_radio", "value", "Calendar") ? document.getElementById('pp_date_calendar').value : '';
}
function elementIsValue(element_id, match_key, match_value) {
    evaluation = 'document.getElementById("'+element_id+'").'+match_key+' == "'+match_value+'";'
    return eval(evaluation);
}

// Adding / editing worksheet data
function setStylistSalon(salon_id, set_salon_id = true) {
    document.getElementById("salon_id").value = salon_id;
    window.salon_id = salon_id;
    uri = "index.php?action=fetch&fetch=stylists&salon_id="+salon_id;
    method = "GET";
    return ajaxRequest(uri,method,function() {
            stylists = JSON.parse(xmlhttp.responseText);
            document.getElementById("stylist_id").innerHTML = "";
            stylist_options = "<option value=\"0\">Select a Stylist</option>";
            stylists.map((v,i) => {
                stylist_options+= "<option value=\""+stylists[i]['stylist_id']+"\"";
                if ( stylists[i]['stylist_id'] == window.stylist_id )
                {
                    stylist_options+= " selected=\"selected\"";
                }
                stylist_options+= ">"+stylists[i]['stylist_name']+"</option>";
            });
            document.getElementById("stylist_id").innerHTML = stylist_options;
    });
}
// Adding / editing worksheet data
function setStylistData(stylist_id, set_pay_period = true) {
    document.getElementById("stylist_id").value = stylist_id;
    if (stylist_id == "" || stylist_id == "0") {
        document.getElementById("pp_service_commission_rate").value = "38";
        document.getElementById("pp_hourly_base").value = "11.00";   
        showPayPeriods(stylist_id, set_pay_period);                       
        return setPayPeriodData("", 'DropMenu', false);
    } else { 
        uri = "index.php?action=fetch&fetch=stylistData&stylist_id="+stylist_id;
        method = "GET";
        return ajaxRequest(uri, method, function(xmlhttp) {
            stylistData = JSON.parse(xmlhttp.responseText);
            if ( stylistData.length < 1 ) return setPayPeriodData("", 'DropMenu', false);
            document.getElementById("pp_service_commission_rate").value = stylistData['stylist_commission']*100;
            document.getElementById("pp_hourly_base").value = stylistData['stylist_base'];
            showPayPeriods(false)
            if ( set_pay_period && window.pp_date != '' ) {
                setPayPeriodData(window.pp_date, 'DropMenu', false);
            }
            window.stylist_id = document.getElementById("stylist_id").value;
        });
    }
}
function setToBlank(element_id) {
    return document.getElementById(element_id).value = '';
}
// Adding / editing worksheet data
function setPayPeriodData(pp_date = '', select_type = 'DropMenu', set_params = true, ) {
    if (pp_date == "") {
        if ( set_params )
        {
             setStylistData(document.getElementById("stylist_id").value, false);
        }
        blank_inputs = ["pp_product_hours", "pp_nonproduct_hours",
                        "pp_commissionable_service", "pp_product_sales"];
        blank_inputs.map(function (element_id) {
            setToBlank(element_id);
        });  
        document.getElementById("action_label").innerHTML = "Adding New Pay Period";
        return;
    } else {
        window.pp_date = pp_date;
        uri = "index.php?action=fetch&fetch=pay_period&salon_id="+document.getElementById('salon_id').value+"&stylist_id="+document.getElementById('stylist_id').value+"&pp_date="+pp_date;
        method = "GET";
        return ajaxRequest(uri, method, function(xmlhttp) {
            if ( set_params )
            {
                if ( set_params && select_type == 'DropMenu' ) document.getElementById("pp_date_calendar").value = 'Click for Calendar';
                else if ( set_params && select_type == 'Calendar' ) document.getElementsByName("pp_date_menu")[0].selectedIndex = 0;
                var pp_date_radio = document.getElementsByName("pp_date_radio");
                pp_date_radio = Array.prototype.slice.call(pp_date_radio);
                pp_date_radio.map((v,i,a) => {
                    if ( a[i].value == select_type ) a[i].checked = true;
                });
            }
            payPeriodData = JSON.parse(xmlhttp.responseText);
            if ( payPeriodData.length != 1 || payPeriodData[0].length > 0 ) return setPayPeriodData();
            document.getElementById("action_label").innerHTML = "Editing Pay Period";
            payPeriodData = payPeriodData[0];
            Object.keys(payPeriodData).map(function(v,i) {
                if ( document.getElementById(v) ) return document.getElementById(v).value = payPeriodData[v];
            });
        });
    }
}

function ajaxRequest( uri, method = "GET", callback, postdata = '' ) {
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this);
        }
    }
    xmlhttp.open(method, uri, true);
    if ( method == "POST" )
    {
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }
    xmlhttp.send(postdata);
    return true;
}
function savePP()
{
    pp_date = (() => {
        var pp_date_select = (() => {
            for ( i = 0; i < document.getElementsByName('pp_date_radio').length; i++)
                if ( document.getElementsByName('pp_date_radio')[i].checked == true ) return i;
            return -1;
        })();
        pp_date_select = (() => {
            if (pp_date_select == -1 ) return '';
            return document.getElementsByName('pp_date_radio')[pp_date_select].value == 'Calendar' ? 'pp_date_calendar' :
            document.getElementsByName('pp_date_radio')[pp_date_select].value == 'DropMenu' ? 'pp_date_menu' : '';
        })();
        
        return pp_date_select != '' ? document.getElementById(pp_date_select).value : '';
    })();
    uri = "index.php";
    method = "POST";
    postdata = "action=newpp&salon_id="+document.getElementById('salon_id').value+
         "&stylist_id="+document.getElementById('stylist_id').value+
         "&pp_product_hours="+document.getElementById('pp_product_hours').value+
         "&pp_nonproduct_hours="+document.getElementById('pp_nonproduct_hours').value+
         "&pp_hourly_base="+document.getElementById('pp_hourly_base').value+
         "&pp_commissionable_service="+document.getElementById('pp_commissionable_service').value+
         "&pp_service_commission_rate="+document.getElementById('pp_service_commission_rate').value+
         "&pp_product_sales="+document.getElementById('pp_product_sales').value+
         "&pp_date="+pp_date;
    return ajaxRequest(uri, method, function(xmlhttp) {
        document.getElementById("save_pp_text").value = "Saved!";
        setTimeout(function() {
            document.getElementById("save_pp_text").value = 'Save';
        }, 5000);
    }, postdata);
}
function toggleCreate(tok, token, token_name, toggleBox = false) {
    document.getElementById(token+'_input').innerHTML = document.getElementById(token+'_input').innerHTML == '' ? "<input type=\"text\" name=\"new_"+token+"_name\" value=\"Add a New "+token_name+"\" onclick=\"toggleBlank(this, '"+token_name+"')\" onblur=\"toggleBlank(this, '"+token_name+"')\" /> <input type=\"button\" value=\"Save\" onclick=\"toggleCreate(this, '"+token+"', '"+token_name+"', true)\" />" : document.getElementById(token+'_input').innerHTML
    if (toggleBox)
    {
        document.getElementById("new_"+token).checked = document.getElementById("new_"+token).checked == "checked" ? "checked" : false;
    }
    else
    {
        if ( token == 'salon' ) setStylistSalon(0);
        if ( token == 'stylist' ) setStylistData(0);
    }
    if ( tok.checked == true )
    {
        document.getElementById(token+'_menu').style.display = 'none';
        document.getElementById(token+'_input').style.display = 'inline';
    }
    else
    {
         document.getElementById(token+'_menu').style.display = 'inline';
         document.getElementById(token+'_input').style.display = 'none';
    }
}
function toggleBlank(tok, token_name) {
    var text = 'Add a New '+token_name
    if ( tok.value == '' ) return tok.value = text;
    if ( tok.value == text ) return tok.value = '';
}