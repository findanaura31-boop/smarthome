let deviceOn=false;

function updateClock(){
 const now=new Date();
 const time=now.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
 document.getElementById("lastUpdate").textContent=time;
 document.getElementById("initialTime").textContent=now.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
}
updateClock(); setInterval(updateClock,1000);

function togglePower(){
 deviceOn=!deviceOn;
 const button=document.getElementById("powerButton");
 document.getElementById("powerText").textContent=deviceOn?"MATIKAN ALAT":"NYALAKAN ALAT";
 document.getElementById("powerStatus").textContent=deviceOn?"ON":"OFF";
 document.getElementById("deviceStatus").textContent=deviceOn?"MENYALA":"MATI";
 document.getElementById("deviceDescription").textContent=deviceOn?"Alat sedang melakukan pembersihan":"Alat sedang tidak digunakan";
 button.classList.toggle("on",deviceOn);
 addActivity(deviceOn?"Alat dinyalakan":"Alat dimatikan",deviceOn?"Sistem pembersihan mulai bekerja":"Sistem pembersihan berhenti","fa-power-off");
 showToast(deviceOn?"Alat pembersih berhasil dinyalakan":"Alat pembersih berhasil dimatikan");
}

function changeMode(mode,button){
 document.querySelectorAll(".mode-btn").forEach(b=>b.classList.remove("active"));
 button.classList.add("active");
 document.getElementById("currentMode").textContent=mode==="AUTO"?"OTOMATIS":"MANUAL";
 addActivity("Mode diubah","Mode "+(mode==="AUTO"?"otomatis":"manual"),"fa-sliders");
 showToast("Mode diubah ke "+(mode==="AUTO"?"Otomatis":"Manual"));
}

function changeSpeed(value){document.getElementById("speedValue").textContent=value;}

function setSuction(value,button){
 document.querySelectorAll(".suction-buttons button").forEach(b=>b.classList.remove("active"));
 button.classList.add("active");
 document.getElementById("suctionValue").textContent=value.toUpperCase();
 addActivity("Daya hisap diubah","Daya hisap: "+value,"fa-wind");
 showToast("Daya hisap: "+value);
}

function simulateSensors(){
 const temperature=Math.floor(Math.random()*8)+29;
 const water=Math.floor(Math.random()*15)+65;
 const dust=Math.floor(Math.random()*20)+15;
 const battery=Math.floor(Math.random()*10)+80;
 document.getElementById("temperature").textContent=temperature;
 document.getElementById("sensorTemperature").textContent=temperature;
 document.getElementById("water").textContent=water;
 document.getElementById("sensorWater").textContent=water;
 document.getElementById("dust").textContent=dust;
 document.getElementById("battery").textContent=battery;
 document.getElementById("sensorBattery").textContent=battery;
 document.getElementById("batteryProgress").style.width=battery+"%";
 document.getElementById("waterProgress").style.width=water+"%";
}
// sensor kini dari robot.js (simulasi / ESP32)

function addActivity(title,description,icon){
 const list=document.getElementById("activityList");
 const now=new Date();
 const time=now.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
 const item=document.createElement("div");
 item.className="activity-item";
 item.innerHTML=`<div class="activity-icon"><i class="fa-solid ${icon}"></i></div><div><strong>${title}</strong><small>${description}</small></div><span>${time}</span>`;
 list.prepend(item);
}

function clearActivity(){document.getElementById("activityList").innerHTML="";showToast("Riwayat aktivitas telah dihapus");}

function showToast(message){
 const toast=document.getElementById("toast");
 document.getElementById("toastMessage").textContent=message;
 toast.classList.add("show");
 setTimeout(()=>toast.classList.remove("show"),2500);
}