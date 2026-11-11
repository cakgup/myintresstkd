/* Bali–Denpasar mockup: fictional records, local persistence, no external messaging. */
(() => {
  'use strict';
  const seed=window.MYINTRESS_TKD_SEED, STORAGE_KEY=seed.key;
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const copy=value=>JSON.parse(JSON.stringify(value));
  const nowWIB=()=>new Date(Date.now()+7*3600000).toISOString().slice(0,16);
  const todayWIB=()=>nowWIB().slice(0,10);
  const clockWIB=()=>new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',dateStyle:'short',timeStyle:'short'}).format(new Date());
  const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
  const validTime=value=>/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value||'')&&validDate(value.slice(0,10))&&Number(value.slice(11,13))<24&&Number(value.slice(14,16))<60;
  const daysBetween=(a,b)=>validDate(a)&&validDate(b)?Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000):null;
  const showDate=value=>validDate(value)?new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Jakarta'}).format(new Date(value+'T12:00:00+07:00')):'Belum dicatat';
  const hoursBetween=(a,b)=>validTime(a)&&validTime(b)&&b>=a?(Date.parse(b+'+07:00')-Date.parse(a+'+07:00'))/3600000:null;
  const median=values=>{const a=values.filter(Number.isFinite).sort((x,y)=>x-y),n=a.length;return n?(n%2?a[n>>1]:(a[n/2-1]+a[n/2])/2):null;};
  const hoursLabel=value=>value===null?'Belum cukup data':value.toLocaleString('id-ID',{maximumFractionDigits:1})+' jam';
  const options=(values,selected)=>values.map(x=>'<option value="'+esc(x)+'" '+(x===selected?'selected':'')+'>'+esc(x)+'</option>').join('');
  const regions=['Bali'],selectedRegion=()=>'Bali';
  const blankState=()=>({version:seed.version,cases:copy(seed.cases),rkud:copy(seed.rkud),audit:[]});
  function loadState(){
    try{const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(raw&&raw.version===seed.version&&Array.isArray(raw.cases)&&Array.isArray(raw.rkud)){
      raw.audit=Array.isArray(raw.audit)?raw.audit:[];
      raw.cases=raw.cases.filter(x=>x&&typeof x.id==='string'&&['A','B'].includes(x.lane)).map(x=>({...x,notes:Array.isArray(x.notes)?x.notes:[]}));
      for(const entry of raw.cases){const original=seed.cases.find(x=>x.id===entry.id);if(!entry.impact&&original?.impact)entry.impact=original.impact;}
      const old=raw.cases.find(x=>x.id==='BALI-RKUD-2026-023'&&x.title==='Konfirmasi penerimaan rekap RKUD Kota Denpasar'&&!x.notes.length);
      if(old){const corrected=seed.cases.find(x=>x.id===old.id);Object.assign(old,{title:corrected.title,evidence:corrected.evidence,context:corrected.context});}
      return raw;
    }}catch{}
    return blankState();
  }
  let state=loadState(),currentTab='peringatan',returnFocus=null,modalBackground=[],popupBackground=[],popupReturnFocus=null;
  function toast(message){$('tkd-toast').textContent=message;$('tkd-toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('tkd-toast').hidden=true,3500);}
  function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{toast('Perubahan tersedia pada sesi ini; penyimpanan browser tidak tersedia.');return false;}}
  function logChange(action,ref,note){state.audit.push({time:clockWIB(),occurredAt:nowWIB(),actor:profile().name,role:profile().label,action,ref,note:String(note||'')});persist();}
    const USER_PROFILES={
    KPPN:{name:'Ni Putu Wulandari',label:'Petugas KPPN',home:'peringatan',focus:'Periksa masalah dan catat pelaksanaan',scope:'Penyaluran TKD pada KPPN Denpasar. Keputusan penugasan dan penutupan diajukan kepada Kepala KPPN.',powers:'Mencatat masalah, mengonfirmasi fakta, meminta kelengkapan data, mencatat tindakan, serta mengusulkan penutupan atau meminta arahan Kepala KPPN.'},
    KepalaKPPN:{name:'I Made Pranata',label:'Kepala KPPN',home:'ikhtisar',focus:'Tetapkan keputusan dan awasi penyelesaian',scope:'Keputusan penyaluran TKD KPPN Denpasar: penugasan, arahan dan persetujuan penutupan. Data RKUD tetap dikelola PKN.',powers:'Menugaskan pemeriksaan, menetapkan PIC dan target, mengarahkan tindak lanjut, meneruskan hambatan ke Kanwil, serta menyetujui atau mengembalikan usulan penutupan.'},
    Kanwil:{name:'Ni Kadek Maharani',label:'Analis Kanwil',home:'ikhtisar',focus:'Konsolidasikan masalah dan kesiapan analisis',scope:'Konsolidasi KPPN Denpasar dan kesiapan informasi RKUD pada Kanwil DJPb Provinsi Bali.',powers:'Memberi respons atas permintaan dukungan KPPN, mengklarifikasi isu informasi RKUD, mencatat penerimaan dan pemakaian data dalam ALCo. Tidak mengubah validasi atau izin sumber PKN.'},
    PKN:{name:'Rizky Pratama',label:'Pengampu PKN',home:'peringatan',focus:'Periksa kualitas dan distribusi rekap RKUD',scope:'Pelaporan bank, periode, cakupan, validasi, izin dan kesiapan distribusi. Tidak mengambil keputusan kasus penyaluran KPPN.',powers:'Mencatat isu RKUD, memperbarui metadata sumber, cakupan, validasi serta izin, dan menindaklanjuti perbaikan atau distribusi rekap. Penerimaan dan pemakaian ALCo dicatat Kanwil.'}
  };
  const profile=()=>USER_PROFILES[$('tkd-role').value]||USER_PROFILES.KPPN;
  const isKppn=()=>['KPPN','KepalaKPPN'].includes($('tkd-role').value);
  const canCreateLane=lane=>lane==='A'?$('tkd-role').value==='KPPN':['Kanwil','PKN'].includes($('tkd-role').value);
  const canEditSource=()=>$('tkd-role').value==='PKN';
  const canEditAnalysis=()=>$('tkd-role').value==='Kanwil';

  const earlyStage=x=>['Sinyal','Pemantauan','Perlu konfirmasi data'].includes(x.stage);
  const roleScope=()=>state.cases.filter(x=>isKppn()?x.lane==='A':$('tkd-role').value==='PKN'?x.lane==='B':true);
  const alertSignature=()=>workForRole().map(x=>[x.id,x.stage,x.deadline||'',x.notes?.length||0].join(':')).sort().join('|');
  const dismissed=()=>{try{return sessionStorage.getItem('myintress.tkd.dismiss.'+$('tkd-role').value)===alertSignature();}catch{return false;}};
  const canReadCase=x=>!!x&&(isKppn()?x.lane==='A':$('tkd-role').value==='PKN'?x.lane==='B':true);
  const sourceScope=()=>isKppn()?[]:state.rkud.filter(x=>x.region==='Bali');
  const earlyOwner=x=>x.responsibleRole||x.owner===USER_PROFILES.Kanwil.name&&'Kanwil'||'PKN';
  const dataRecipient=x=>x.escalationTarget==='Kanwil DJPb'?'Kanwil':'PKN';
  function caseActions(x){
    if(!canReadCase(x)||x.stage==='Selesai')return [];
    const role=$('tkd-role').value;
    if(x.lane==='A'){
      if(role==='KPPN'){if(earlyStage(x))return ['confirm','wait','reject'];if(x.stage==='Ditugaskan')return ['progress','escalate'];if(x.stage==='Ditindaklanjuti')return ['progress','escalate','finish'];return [];}
      if(role==='KepalaKPPN'){if(x.stage==='Menunggu persetujuan')return ['approve','returnWork'];if(earlyStage(x))return ['assignReview'];if(x.stage==='Terverifikasi'||['Ditugaskan','Ditindaklanjuti'].includes(x.stage))return ['plan'];if(x.stage==='Eskalasi'&&x.escalationTarget==='Kepala KPPN')return ['plan','escalate'];}
      return role==='Kanwil'&&x.stage==='Eskalasi'&&x.escalationTarget==='Kanwil DJPb'?['respond']:[];
    }
    if(!['Kanwil','PKN'].includes(role))return [];
    if(x.stage==='Eskalasi')return role===dataRecipient(x)?['respond']:[];
    if(role!==earlyOwner(x))return [];
    if(earlyStage(x))return ['confirm','wait','reject'];
    if(x.stage==='Terverifikasi')return ['plan','reject'];
    if(x.stage==='Ditugaskan')return ['progress','escalate'];
    return x.stage==='Ditindaklanjuti'?['progress','escalate','finish']:[];
  }
  const overdue=x=>x.stage!=='Selesai'&&validDate(x.deadline)&&x.deadline<todayWIB();
  const stageLabel=x=>({'Sinyal':'Perlu diperiksa','Pemantauan':'Perlu diperiksa','Perlu konfirmasi data':'Perlu konfirmasi data','Terverifikasi':'Perlu penugasan','Ditugaskan':'Siap ditindaklanjuti','Ditindaklanjuti':'Dalam penanganan','Eskalasi':'Menunggu dukungan','Menunggu persetujuan':'Menunggu persetujuan','Selesai':'Selesai'}[x.stage]||x.stage);
  const stageColor=stage=>stage==='Selesai'?'tkd-low':stage==='Eskalasi'?'tkd-medium':'tkd-a';
  function workForRole(){return roleScope().filter(x=>{
    if(!caseActions(x).length)return false;
    if($('tkd-role').value!=='KepalaKPPN')return true;
    return ['Terverifikasi','Menunggu persetujuan'].includes(x.stage)||x.stage==='Eskalasi'&&x.escalationTarget==='Kepala KPPN'||earlyStage(x)&&!x.owner||overdue(x);
  });}
  const actionLabels={assignReview:'Tugaskan pemeriksaan',approve:'Setujui penutupan',returnWork:'Kembalikan untuk perbaikan',respond:'Catat arahan / respons',confirm:'Konfirmasi masalah',wait:'Minta konfirmasi data',reject:'Usulkan tidak relevan',plan:'Tetapkan tindak lanjut',progress:'Catat perkembangan',escalate:'Minta dukungan',finish:'Ajukan penutupan'};
  const labelForAction=(action,x)=>action==='finish'&&x.lane==='B'?'Selesaikan isu data':action==='reject'&&x.lane==='B'?'Tutup: tidak relevan':action==='plan'&&x.stage==='Eskalasi'?'Beri arahan tindak lanjut':actionLabels[action];
  function nextCaseAction(x){
    if(x.stage==='Selesai')return 'Hasil dan bukti tersedia pada riwayat kasus.';
    if(x.stage==='Menunggu persetujuan')return $('tkd-role').value==='KepalaKPPN'?'Periksa hasil dan bukti, lalu setujui atau kembalikan usulan.':'Menunggu Kepala KPPN memeriksa usulan penutupan.';
    if(x.stage==='Eskalasi')return caseActions(x).includes('respond')?'Catat arahan agar unit pemilik dapat melanjutkan penanganan.':'Menunggu dukungan '+x.escalationTarget+'.';
    if(earlyStage(x))return x.lane==='A'?'Konfirmasi persyaratan dan catat hasil pemeriksaan.':'Konfirmasi periode, kelengkapan dan izin sumber.';
    if(x.stage==='Terverifikasi')return x.lane==='A'&&$('tkd-role').value!=='KepalaKPPN'?'Menunggu Kepala KPPN menetapkan PIC dan target.':'Tetapkan PIC, target dan rencana yang dapat ditindaklanjuti.';
    return 'Catat tindakan dan respons; ajukan penyelesaian setelah bukti tersedia.';
  }
  const statusMatch=(x,status)=>status==='all'||status==='review'&&earlyStage(x)||status==='plan'&&x.stage==='Terverifikasi'||status==='progress'&&['Ditugaskan','Ditindaklanjuti'].includes(x.stage)||status==='approval'&&x.stage==='Menunggu persetujuan'||status==='support'&&x.stage==='Eskalasi'||status==='overdue'&&overdue(x)||status==='done'&&x.stage==='Selesai';
  function matches(x){const q=$('tkd-search').value.trim().toLocaleLowerCase('id-ID');return ($('tkd-kind').value==='all'||x.lane===$('tkd-kind').value)&&statusMatch(x,$('tkd-status').value)&&(!q||[x.id,x.title,x.owner,x.region,x.locality,x.transfer,x.source,x.evidence].join(' ').toLocaleLowerCase('id-ID').includes(q));}
  const visibleCases=()=>roleScope().filter(matches);
  function priority(x){
    const d=daysBetween(todayWIB(),x.deadline);
    if(x.stage==='Selesai')return {rank:9,label:'Selesai',tone:'low'};
    if(d!==null&&d<0)return {rank:0,label:'Terlambat '+Math.abs(d)+' hari',tone:'high'};
    if(d===0)return {rank:1,label:'Target hari ini',tone:'high'};
    if(x.stage==='Menunggu persetujuan')return {rank:2,label:'Perlu persetujuan',tone:'medium'};
    if(d!==null&&d<=3)return {rank:2,label:'Target '+d+' hari lagi',tone:'medium'};
    if(!x.deadline)return {rank:3,label:'Target belum ditetapkan',tone:'pending'};
    return {rank:x.severity==='tinggi'?3:4,label:'Target '+showDate(x.deadline),tone:'pending'};
  }
  const ordered=rows=>rows.slice().sort((a,b)=>priority(a).rank-priority(b).rank||(a.deadline||'9999').localeCompare(b.deadline||'9999')||a.id.localeCompare(b.id));
  const impact=x=>x.impact||(x.lane==='B'?'Analisis APBD berpotensi menggunakan informasi kas yang belum lengkap.':x.dimension==='D3'?'Hambatan kegiatan berpotensi memengaruhi penyelesaian tahapan penyaluran.':'Kelengkapan persyaratan berpotensi menunda proses penyaluran TKD.');
  function workCard(x){
    const p=priority(x),actions=caseActions(x),primary=actions[0];
    return '<article class="tkd-work-card" data-case-record="'+esc(x.id)+'"><div class="tkd-work-main"><div class="tkd-inline-tags"><span class="tkd-tag">'+(x.lane==='A'?'Penyaluran TKD':'Informasi RKUD')+'</span><span class="tkd-tag tkd-'+p.tone+'">'+esc(p.label)+'</span></div><h3>'+esc(x.title)+'</h3><p class="tkd-facts">'+esc(x.evidence)+'</p><p class="tkd-impact"><b>'+(x.stage==='Selesai'?'Hasil:':'Potensi dampak:')+'</b> '+esc(x.stage==='Selesai'?x.result:impact(x))+'</p><p class="tkd-work-next"><b>Berikutnya:</b> '+esc(nextCaseAction(x))+'</p><p class="tkd-record-id">'+esc(x.id)+' · '+esc(stageLabel(x))+'</p></div><div class="tkd-work-side"><p><b>PIC</b><span>'+esc(x.owner||'Belum ditetapkan')+'</span></p><p><b>Target tindak lanjut</b><span>'+esc(x.deadline?showDate(x.deadline):'Belum ditetapkan')+'</span></p>'+(primary?'<button type="button" class="tkd-button" data-case-action="'+primary+'" data-case-id="'+esc(x.id)+'">'+esc(labelForAction(primary,x))+'</button>':'')+'<button type="button" class="tkd-text-button" data-tkd-case="'+esc(x.id)+'">'+(x.stage==='Selesai'?'Hasil & riwayat':'Rincian & tindakan lain')+'</button></div></article>';
  }
  function rkudIssues(x){
    const issues=[];
    if(!validDate(x.period))issues.push('Periode posisi');
    if(x.analysisNeedsReview)issues.push('Konfirmasi ulang Kanwil');
    if(!x.received)issues.push('Penerimaan PKN');
    if(x.validation!=='Valid'||!x.validatedAt)issues.push('Validasi sumber');
    if(x.coverage!=='Lengkap')issues.push('Cakupan');
    if(x.permission!=='Disetujui')issues.push('Izin distribusi');
    if(!x.readyAt)issues.push('Kesiapan distribusi');
    if(!x.kanwilAt)issues.push('Penerimaan Kanwil');
    const dates=[x.period,x.received,x.validatedAt,x.readyAt,x.kanwilAt,x.alcoAt].filter(Boolean);
    if(dates.some((v,i)=>!validDate(v)||i>0&&v<dates[i-1]))issues.push('Urutan tanggal');
    return issues;
  }
  const sourceReady=x=>x.validation==='Valid'&&x.coverage==='Lengkap'&&x.permission==='Disetujui'&&[x.period,x.received,x.validatedAt,x.readyAt].every(validDate)&&x.period<=x.received&&x.received<=x.validatedAt&&x.validatedAt<=x.readyAt;
  const rkudReady=x=>rkudIssues(x).length===0;
  const filteredRkud=()=>sourceScope().filter(x=>$('tkd-rkud-filter').value==='all'||($('tkd-rkud-filter').value==='ready'?rkudReady(x):!rkudReady(x)));
  function applyUserProfile(){
    const p=profile();$('tkd-user-context').textContent=p.label+' · '+(isKppn()?'KPPN Denpasar':$('tkd-role').value==='PKN'?'Direktorat PKN · RKUD Bali':'Kanwil DJPb Provinsi Bali');document.querySelectorAll('[data-user-role]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.userRole===$('tkd-role').value)));$('header-user-role').textContent=p.label;$('header-user-initials').textContent=({KPPN:'PT',KepalaKPPN:'KK',Kanwil:'AK',PKN:'PK'})[$('tkd-role').value];
    $('profile-menu').querySelector('summary').setAttribute('aria-label',p.name+' · '+p.label+'; ganti pengguna');
    document.querySelectorAll('[data-tkd-add-case]').forEach(el=>{el.dataset.tkdAddCase=isKppn()?'A':'B';el.hidden=!canCreateLane(el.dataset.tkdAddCase);});
    $('tkd-inbox-title').textContent=$('tkd-role').value==='KepalaKPPN'?'Keputusan yang menunggu Anda':$('tkd-role').value==='Kanwil'?'Konsolidasi & klarifikasi Anda':$('tkd-role').value==='PKN'?'Pemeriksaan sumber RKUD':'Perlu tindakan Anda';
    $('tkd-kind-field').hidden=$('tkd-role').value!=='Kanwil';
    if($('tkd-role').value!=='Kanwil')$('tkd-kind').value='all';
    $('tkd-add-rkud').hidden=!canEditSource();$('tkd-import-label').hidden=!canEditSource();$('tkd-rkud-file').disabled=!canEditSource();
    $('tkd-rkud-summary').hidden=isKppn();
    $('tkd-status').querySelector('[value="done"]').disabled=currentTab==='peringatan';
    if(currentTab==='peringatan'&&$('tkd-status').value==='done')$('tkd-status').value='all';
  }
  function emptyMessage(message){return '<div class="tkd-empty"><p>'+esc(message)+'</p>'+($('tkd-search').value||$('tkd-status').value!=='all'||$('tkd-kind').value!=='all'?'<button type="button" class="tkd-text-button" data-clear-filters>Hapus filter untuk melihat seluruh daftar</button>':'')+'</div>';}
  function renderWork(){
    const all=workForRole(),rows=ordered(all.filter(matches));
    $('tkd-task-count').textContent=String(all.length);
    $('tkd-work-summary').textContent=rows.length+' dari '+all.length+' pekerjaan untuk '+profile().label+'. Urutan mengikuti target dan kebutuhan keputusan.';
    $('tkd-inbox-cases').innerHTML=currentTab==='peringatan'&&!$('tkd-page').hidden?(rows.map(workCard).join('')||emptyMessage(all.length?'Tidak ada pekerjaan yang cocok dengan filter.':'Tidak ada tindakan yang menunggu pengguna ini. Riwayat tersedia di Semua kasus.')):'';
    const missing=sourceScope().filter(x=>!rkudReady(x)).length;
    $('tkd-data-attention').hidden=isKppn()||missing===0;
    $('tkd-data-attention-text').textContent=missing+' rekap RKUD perlu kelengkapan. Periksa persyaratan data sebelum digunakan untuk analisis.';
    $('tkd-register-summary').textContent=visibleCases().length+' dari '+roleScope().length+' kasus sesuai kewenangan; termasuk kasus selesai.';
    $('tkd-cases-all').innerHTML=currentTab==='register'&&!$('tkd-page').hidden?(ordered(visibleCases()).map(workCard).join('')||emptyMessage('Tidak ada kasus yang cocok dengan filter.')):'';
    const active=workForRole().length;$('tkd-home-count').textContent=active+' Perlu Tindakan';$('tkd-home-summary').textContent=active?'Ada '+active+' pekerjaan untuk '+profile().label+'. Lihat pemicu, PIC dan langkah berikutnya.':'Tidak ada pekerjaan yang menunggu Anda. Riwayat tetap tersedia di modul TKD.';
    $('ews-alert').hidden=active===0||dismissed();
    const bell=document.querySelector('.ews-bell');bell.classList.toggle('has-alerts',active>0);bell.classList.toggle('is-urgent',workForRole().some(x=>priority(x).rank<=1));bell.setAttribute('aria-label','Peringatan TKD: '+active+' pekerjaan untuk '+profile().label);
    $('tkd-live-status').textContent=rows.length+' pekerjaan ditampilkan.';
  }
  function renderSummary(){
    const cases=roleScope(),rkud=sourceScope(),role=$('tkd-role').value;
    $('tkd-summary-title').textContent='Ringkasan · '+profile().label;$('tkd-summary-description').textContent=profile().focus+'. Seluruh kasus sesuai kewenangan, tanpa filter daftar.';
    const k=(value,label,description,filter,view='register')=>({value,label,description,filter,view});
    const items=role==='KPPN'?[k(cases.filter(earlyStage).length,'Perlu pemeriksaan','Konfirmasi fakta dan persyaratan','review'),k(cases.filter(x=>['Ditugaskan','Ditindaklanjuti'].includes(x.stage)).length,'Dalam penanganan','Catat tindakan dan respons','progress'),k(cases.filter(x=>x.stage==='Menunggu persetujuan').length,'Menunggu Kepala KPPN','Lihat usulan dan bukti','approval')]:role==='KepalaKPPN'?[k(cases.filter(x=>x.stage==='Terverifikasi').length,'Perlu penugasan','Tetapkan PIC dan target','plan'),k(cases.filter(x=>x.stage==='Menunggu persetujuan').length,'Perlu persetujuan','Periksa hasil petugas','approval'),k(cases.filter(overdue).length,'Target terlewat','Prioritaskan arahan','overdue')]:role==='Kanwil'?[k(cases.filter(x=>x.stage==='Eskalasi'&&x.escalationTarget==='Kanwil DJPb').length,'Permintaan dukungan','Konsolidasikan hambatan KPPN','support'),k(rkud.filter(x=>!rkudReady(x)).length,'RKUD perlu kelengkapan','Periksa simpul data yang kosong','missing','rkud'),k(rkud.filter(rkudReady).length,'RKUD siap telaah','Lihat sumber dan periode','ready','rkud')]:[k(rkud.filter(x=>!rkudReady(x)).length,'Perlu pemeriksaan data','Cakupan, validasi dan izin','missing','rkud'),k(cases.filter(x=>x.stage!=='Selesai').length,'Kasus sumber aktif','Tindak lanjuti isu sumber','all'),k(rkud.filter(rkudReady).length,'Rekap siap telaah','Jejak distribusi lengkap','ready','rkud')];
    $('tkd-kpis').innerHTML=items.map(x=>'<button type="button" class="tkd-kpi" data-kpi-view="'+x.view+'" data-kpi-filter="'+x.filter+'"><strong>'+esc(x.value)+'</strong><span>'+esc(x.label)+'</span><small>'+esc(x.description)+' →</small></button>').join('');
    const verify=cases.map(x=>hoursBetween(x.detectedAt,x.verifiedAt)).filter(x=>x!==null),act=cases.map(x=>hoursBetween(x.verifiedAt,x.actedAt)).filter(x=>x!==null);
    $('tkd-efficiency').innerHTML='<p><b>'+hoursLabel(median(verify))+'</b><span>Median pencatatan → verifikasi · n='+verify.length+'</span></p><p><b>'+hoursLabel(median(act))+'</b><span>Median verifikasi → tindakan · n='+act.length+'</span></p><p><b>'+cases.filter(x=>x.stage==='Selesai').length+' kasus</b><span>Selesai dengan riwayat tersimpan</span></p>';
    $('tkd-rkud-status-summary').textContent=rkud.filter(rkudReady).length+' dari '+rkud.length+' rekap memenuhi kelengkapan, validasi, izin dan jejak distribusi.';
  }
  function renderRkud(){
    const rows=filteredRkud(),lags=rows.map(x=>daysBetween(x.readyAt,x.kanwilAt)).filter(x=>x!==null&&x>=0);
    $('tkd-rkud-lag').textContent=lags.length?'Median distribusi PKN → Kanwil '+median(lags)+' hari kalender; '+lags.length+' rekap dengan tanggal lengkap.':'Jeda distribusi belum dapat dihitung dari tanggal yang tersedia.';
    $('tkd-rkud-rows').innerHTML=rows.map(x=>'<tr data-rkud-record="'+esc(x.id)+'"><td><strong>'+esc(x.pemda)+'</strong><br>'+esc(x.bank)+'</td><td>'+showDate(x.period)+'</td><td><span class="tkd-tag '+(rkudReady(x)?'tkd-low':'tkd-medium')+'">'+(rkudReady(x)?'Siap telaah':'Perlu kelengkapan')+'</span></td><td>'+esc(rkudIssues(x).join(' · ')||'Lengkap')+'</td><td><button type="button" class="tkd-button tkd-outline" data-tkd-rkud="'+esc(x.id)+'">Periksa rekap</button></td></tr>').join('')||'<tr><td colspan="5">Tidak ada rekap sesuai kelayakan yang dipilih.</td></tr>';
  }
  function renderAll(){applyUserProfile();renderWork();if(currentTab==='ikhtisar')renderSummary();else $('tkd-kpis').innerHTML='';if(currentTab==='rkud')renderRkud();else $('tkd-rkud-rows').innerHTML='';$('tkd-clear-filters').hidden=!$('tkd-search').value&&$('tkd-status').value==='all'&&$('tkd-kind').value==='all';}
  function clearFilters(){ $('tkd-search').value='';$('tkd-status').value='all';$('tkd-kind').value='all';renderAll();}
  function switchTab(tab,{focus=false}={}){
    if(!['peringatan','register','ikhtisar','rkud'].includes(tab)||tab==='rkud'&&isKppn())tab='peringatan';
    currentTab=tab;
    if(tab==='peringatan'&&$('tkd-status').value==='done')$('tkd-status').value='all';
    $('tkd-filters').hidden=!['peringatan','register'].includes(tab);
    for(const button of document.querySelectorAll('[data-tkd-tab]')){const selected=button.dataset.tkdTab===(tab==='rkud'?'ikhtisar':tab);button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;}
    for(const panel of document.querySelectorAll('.tkd-view'))panel.hidden=panel.id!=='tkd-view-'+tab;
    renderAll();$('tkd-popup-content').scrollTop=0;if(focus)(tab==='rkud'?$('tkd-rkud-title'):$(tab==='peringatan'?'tkd-inbox-title':'tkd-tab-'+tab)).focus();
  }
  function launch(trigger=null){
    if($('tkd-page').hidden){popupReturnFocus=trigger||document.querySelector('.ews-bell');popupBackground=[document.querySelector('.site-header'),document.querySelector('.dashboard-main'),document.querySelector('.site-footer')].map(x=>[x,x.inert]);popupBackground.forEach(([x])=>x.inert=true);$('tkd-page').hidden=false;document.body.style.overflow='hidden';}
    document.querySelectorAll('[data-tkd-open]').forEach(x=>x.setAttribute('aria-expanded','true'));renderAll();
  }
  function close(){closeDialog();if($('tkd-page').hidden)return;$('tkd-page').hidden=true;popupBackground.forEach(([x,was])=>x.inert=was);popupBackground=[];document.body.style.overflow='';document.querySelectorAll('[data-tkd-open]').forEach(x=>x.setAttribute('aria-expanded','false'));history.replaceState(null,'',location.pathname+location.search);if(popupReturnFocus?.isConnected&&popupReturnFocus.getClientRects().length)popupReturnFocus.focus();else document.querySelector('.ews-bell').focus();}
  function openDialog(title,subtitle,content){
    if($('tkd-dialog').hidden){returnFocus=document.activeElement;modalBackground=[document.querySelector('.site-header'),$('tkd-page'),document.querySelector('.dashboard-main'),document.querySelector('.site-footer')].map(x=>[x,x.inert]);modalBackground.forEach(([x])=>x.inert=true);}
    $('tkd-dialog-title').textContent=title;$('tkd-dialog-subtitle').textContent=subtitle;$('tkd-dialog-content').innerHTML=content;$('tkd-dialog').hidden=false;document.body.style.overflow='hidden';document.querySelector('.tkd-dialog').scrollTop=0;$('tkd-dialog-close').focus();
  }
  function closeDialog(){if($('tkd-dialog').hidden)return;$('tkd-dialog').hidden=true;document.body.style.overflow=$('tkd-page').hidden?'':'hidden';modalBackground.forEach(([x,was])=>x.inert=was);modalBackground=[];if(returnFocus?.isConnected&&returnFocus.getClientRects().length)returnFocus.focus();else $('tkd-tab-peringatan').focus();}
  function formError(form,message){let error=form.querySelector('[role="alert"]');if(!error){error=document.createElement('p');error.className='tkd-form-error tkd-wide';error.setAttribute('role','alert');error.tabIndex=-1;form.append(error);}error.textContent=message;error.tabIndex=-1;error.focus();}
    function openNewCase(lane='A') {
    if(!canCreateLane(lane)){toast('Pencatatan masalah dilakukan oleh petugas/pengampu sesuai jenisnya.');return;}
    const html='<form class="tkd-form" id="tkd-case-form" data-mode="new"><label>Jenis masalah<select name="lane" required><option value="A" '+(!canCreateLane('A')?'disabled ':'')+(lane==='A'?'selected':'')+'>Penyaluran TKD</option><option value="B" '+(!canCreateLane('B')?'disabled ':'')+(lane==='B'?'selected':'')+'>Informasi RKUD</option></select></label><label>Wilayah<select name="region" required>'+options(regions,selectedRegion())+'</select></label><label class="tkd-wide">Apa masalahnya?<input name="title" maxlength="180" required placeholder="Tuliskan masalah yang perlu diperiksa"></label><label class="tkd-wide">Fakta atau bukti awal<textarea name="evidence" required maxlength="1500" placeholder="Apa yang diketahui? Hindari asumsi pelanggaran."></textarea></label><label class="tkd-wide">Sumber dan tanggal data<input name="source" required maxlength="200" placeholder="Dokumen/sistem sumber dan tanggal posisi"></label><details class="tkd-wide tkd-source"><summary>Rincian tambahan</summary><div class="tkd-form" style="margin-top:.7rem"><label>Jenis transfer<select name="transfer">'+options(['Dana Desa','DAK Fisik','DAK Nonfisik','DAU','DBH','RKUD','Lainnya'],lane==='B'?'RKUD':'Dana Desa')+'</select></label><label>Waktu pencatatan (WIB)<input name="detectedAt" type="datetime-local" value="'+nowWIB()+'" required></label></div></details><div class="tkd-wide tkd-form-foot"><p>Disimpan sebagai masalah yang perlu diperiksa. PIC ditetapkan setelah konfirmasi.</p><button type="submit" class="tkd-button">Catat masalah</button></div></form>';
    openDialog('Catat masalah','Catat fakta, sumber dan tanggal posisi untuk pemeriksaan.',html);
  }

  function openCase(id){
    const x=state.cases.find(x=>x.id===id);if(!canReadCase(x))return;
    const actions=caseActions(x);
    const history=(x.notes||[]).slice().reverse().map(n=>'<div><b>'+esc(n.time)+' · '+esc(n.stage)+'</b><br>'+esc(n.note)+'</div>').join('')||'<p class="tkd-subtle">Belum ada catatan penanganan.</p>';
    const html='<div class="tkd-inline-tags"><span class="tkd-tag '+stageColor(x.stage)+'">'+esc(stageLabel(x))+'</span><span class="tkd-tag tkd-pending">'+esc(x.region)+' · '+(x.lane==='A'?'Penyaluran TKD':'Informasi RKUD')+'</span></div><p class="tkd-case-intro">'+esc(x.evidence)+'</p><div class="tkd-choice-note"><b>Langkah berikutnya</b><p>'+esc(nextCaseAction(x))+'</p></div><div class="tkd-case-ownership"><p><b>PIC</b><br>'+esc(x.owner||'Belum ditetapkan')+'</p><p><b>Target</b><br>'+esc(x.deadline||'Belum ditetapkan')+'</p></div>'+(x.stage==='Menunggu persetujuan'?'<div class="tkd-data-guard"><b>Usulan petugas · '+esc(x.proposedOutcome||'Penutupan')+'</b><p>'+esc(x.proposedResult||'')+'</p><p>Bukti: '+esc(x.proposedEvidence||'')+'</p><p>Diajukan oleh '+esc(x.proposedBy||'petugas')+'</p></div>':'')+(x.stage==='Selesai'?'<div class="tkd-data-guard"><b>Hasil</b><p>'+esc(x.result)+'</p><p>Bukti: '+esc(x.evidenceRef||'—')+'</p></div>':'')+'<div class="tkd-action-choices">'+actions.map((a,i)=>'<button type="button" class="tkd-button '+(i?'tkd-outline':'')+'" data-case-action="'+a+'" data-case-id="'+esc(x.id)+'">'+labelForAction(a,x)+'</button>').join('')+'</div>'+(!actions.length&&x.stage!=='Selesai'?'<p class="tkd-subtle">Penanganan dilakukan oleh '+(x.lane==='A'?'KPPN/Kanwil':'PKN/Kanwil')+'. Sudut pandang ini hanya untuk membaca.</p>':'')+'<details class="tkd-source"><summary>Sumber, kronologi &amp; riwayat</summary><p>'+esc(x.source)+' · '+esc(x.origin)+' · '+esc(x.dimension)+'</p><p>'+esc(x.context||'')+'</p>'+[['Sinyal dicatat',x.detectedAt],['Diverifikasi',x.verifiedAt],['Ditugaskan',x.assignedAt],['Tindakan pertama',x.actedAt],['Ditutup',x.closedAt]].filter(a=>a[1]).map(a=>'<p>'+a[0]+': '+esc(a[1].replace('T',' '))+' WIB</p>').join('')+'<div class="tkd-audit-log">'+history+'</div></details>';
    openDialog(x.title,'Pilih tindakan berikutnya untuk melanjutkan penanganan kasus.',html);
  }
  function escalationTargets(x){
    if(x.lane==='A')return $('tkd-role').value==='KPPN'?['Kepala KPPN']:['Kanwil DJPb'];
    return $('tkd-role').value==='Kanwil'?['Direktorat PKN / pengampu data']:['Kanwil DJPb'];
  }
  function openCaseAction(id,action){
    const x=state.cases.find(x=>x.id===id);if(!x||!caseActions(x).includes(action))return;
    const input=(name,label,value='',type='text',required=true)=>'<label>'+label+'<input name="'+name+'" type="'+type+'" value="'+esc(value)+'" '+(required?'required':'')+' '+(name==='decider'?'readonly':'')+' maxlength="200"></label>';
    const area=(name,label,value='')=>'<label class="tkd-wide">'+label+'<textarea name="'+name+'" required maxlength="1500">'+esc(value)+'</textarea></label>';
    let fields='';
    if(action==='assignReview')fields=input('owner','Petugas pemeriksa',x.owner||'')+input('deadline','Target pemeriksaan',x.deadline||'','date')+area('note','Arahan pemeriksaan');
    if(action==='approve')fields=area('note','Catatan persetujuan atas hasil dan bukti usulan');
    if(action==='returnWork')fields=area('note','Apa yang perlu diperbaiki petugas?')+input('deadline','Target perbaikan',x.deadline||'','date');
    if(action==='respond')fields=area('note','Hasil konsolidasi dan arahan Kanwil')+input('deadline','Target tindak lanjut KPPN',x.deadline||'','date');
    if(action==='confirm')fields=area('note','Apa yang sudah diperiksa dan dikonfirmasi?');
    if(action==='wait')fields=area('note','Data apa yang perlu dikonfirmasi, dan kepada siapa?')+input('deadline','Tanggal tinjau kembali',x.deadline||'','date');
    if(action==='reject')fields=area('note','Mengapa peringatan tidak relevan?')+input('evidenceRef','Referensi bukti verifikasi');
    if(action==='plan')fields=input('owner','Penanggung jawab',x.owner||'')+input('deadline','Target tindak lanjut',x.deadline||'','date')+area('recommendation',x.lane==='A'?'Apa tindakan atau asistensi yang disepakati?':'Apa perbaikan atau klarifikasi data yang disepakati?',x.recommendation||'');
    if(action==='progress')fields=area('note','Tindakan yang sudah dilakukan dan respons yang diterima')+input('deadline','Target peninjauan berikutnya',x.deadline||'','date');
    if(action==='escalate')fields='<label>Unit yang dimintai bantuan<select name="escalationTarget" required>'+options(['',...escalationTargets(x)],escalationTargets(x).includes(x.escalationTarget)?x.escalationTarget:'')+'</select></label>'+input('deadline','Target peninjauan respons',x.deadline||'','date')+area('escalationReason','Apa yang melampaui kewenangan dan dukungan apa yang diminta?');
    if(action==='finish')fields=area('result','Apa hasil penyelesaiannya?')+input('evidenceRef','Referensi bukti penyelesaian',x.evidenceRef||'');
    const actor=profile().name+' — '+profile().label+'';
    const html='<p class="tkd-case-intro"><b>'+esc(x.title)+'</b></p><details class="tkd-source"><summary>Fakta &amp; sumber pemeriksaan</summary><p>'+esc(x.evidence)+'</p><p>'+esc(x.source)+'</p></details>'+(['approve','returnWork'].includes(action)?'<div class="tkd-data-guard"><b>Usulan '+esc(x.proposedBy||'petugas')+'</b><p>'+esc(x.proposedResult||'')+'</p><p>Bukti: '+esc(x.proposedEvidence||'')+'</p></div>':'')+'<form id="tkd-action-form" class="tkd-form" data-id="'+esc(id)+'" data-action="'+action+'">'+fields+'<details class="tkd-wide tkd-source"><summary>Waktu &amp; pengampu pencatatan</summary><div class="tkd-form" style="margin-top:.6rem">'+input('occurredAt','Waktu pencatatan (WIB)',nowWIB(),'datetime-local')+input('decider','Pengguna / pejabat pemutus',actor)+'</div></details><div class="tkd-wide tkd-form-foot"><button type="button" class="tkd-button tkd-outline" data-tkd-case="'+esc(id)+'">Kembali</button><button type="submit" class="tkd-button">'+labelForAction(action,x)+'</button></div><p class="tkd-wide tkd-subtle" id="tkd-action-error" role="alert"></p></form>';
    openDialog(labelForAction(action,x),action==='escalate'?'Kasus lokal tetap ditangani unit pemilik; bantuan diminta sesuai kewenangan.':'Isi informasi untuk langkah ini. Riwayat penanganan tetap tersimpan.',html);
  }
  function saveCaseAction(form){
    const x=state.cases.find(x=>x.id===form.dataset.id),action=form.dataset.action;
    const fail=message=>formError(form,message);
    if(!x||!caseActions(x).includes(action)){fail('Tindakan tidak tersedia untuk tahap atau sudut pandang ini.');return;}
    const v=Object.fromEntries(new FormData(form));for(const k of Object.keys(v))v[k]=v[k].trim();v.decider=profile().name+' — '+profile().label+'';
    const required={assignReview:['owner','deadline','note'],approve:['note'],returnWork:['note','deadline'],respond:['note','deadline'],confirm:['note'],wait:['note','deadline'],reject:['note','evidenceRef'],plan:['owner','deadline','recommendation'],progress:['note','deadline'],escalate:['escalationTarget','escalationReason','deadline'],finish:['result','evidenceRef']}[action];
    if(!validTime(v.occurredAt)||v.occurredAt>nowWIB()||!v.decider||required.some(k=>!v[k])){fail('Lengkapi catatan dan isian yang diperlukan untuk tindakan ini.');return;}
    const dates=[x.detectedAt,x.verifiedAt,x.assignedAt,x.reviewAssignedAt,x.actedAt,x.proposedAt,...(x.notes||[]).map(n=>n.occurredAt)].filter(Boolean);
    if(dates.some(d=>d>v.occurredAt)){fail('Waktu pencatatan tidak boleh mendahului langkah sebelumnya.');return;}
    if(v.deadline&&(!validDate(v.deadline)||v.deadline<v.occurredAt.slice(0,10))){fail('Target peninjauan tidak boleh sebelum tanggal pencatatan tindakan.');return;}
    if(['plan','progress','escalate','finish'].includes(action)&&!x.verifiedAt){fail('Kasus perlu dikonfirmasi terlebih dahulu.');return;}
    if(['progress','escalate','finish'].includes(action)&&!x.owner){fail('Tetapkan penanggung jawab terlebih dahulu.');return;}
    if(action==='escalate'&&!escalationTargets(x).includes(v.escalationTarget)){fail('Unit tujuan tidak sesuai kewenangan pengguna ini.');return;}
    if(action==='approve'&&(!x.proposedResult||!x.proposedEvidence)){fail('Usulan penutupan harus memiliki hasil dan referensi bukti.');return;}
    const before=x.stage,t=v.occurredAt;
    if(action==='escalate')x.escalatedByRole=$('tkd-role').value;
    if(action==='plan'&&x.lane==='B')x.responsibleRole=v.owner===USER_PROFILES.Kanwil.name?'Kanwil':v.owner===USER_PROFILES.PKN.name?'PKN':$('tkd-role').value;
    x.detectedAt=x.detectedAt||t;x.decider=v.decider;x.updatedAt=clockWIB();
    if(action==='confirm'){x.stage='Terverifikasi';x.verifiedAt=t;x.signalQuality='Relevan';}
    if(action==='wait'){x.stage='Perlu konfirmasi data';x.deadline=v.deadline;}
    if(action==='reject'){
      x.signalQuality='Tidak relevan';x.verifiedAt=x.verifiedAt||t;
      if(x.lane==='A'){x.reviewFromStage=before;x.stage='Menunggu persetujuan';x.proposedResult=v.note;x.proposedEvidence=v.evidenceRef;x.proposedAt=t;x.proposedBy=profile().name;x.proposedOutcome='Tidak relevan';}
      else{x.stage='Selesai';x.closedAt=t;x.result=v.note;x.evidenceRef=v.evidenceRef;}
    }
    if(action==='plan'){x.stage='Ditugaskan';x.owner=v.owner;x.deadline=v.deadline;x.recommendation=v.recommendation;x.assignedAt=x.assignedAt||t;}
    if(action==='progress'){x.stage='Ditindaklanjuti';x.actedAt=x.actedAt||t;x.deadline=v.deadline;}
    if(action==='escalate'){x.stageBeforeEscalation=x.stage==='Eskalasi'?(x.stageBeforeEscalation||'Ditugaskan'):x.stage;x.stage='Eskalasi';x.actedAt=x.actedAt||t;x.deadline=v.deadline;x.escalationTarget=v.escalationTarget;x.escalationReason=v.escalationReason;}
    if(action==='finish'){
      if(x.lane==='A'){x.reviewFromStage=before;x.stage='Menunggu persetujuan';x.proposedResult=v.result;x.proposedEvidence=v.evidenceRef;x.proposedAt=t;x.proposedBy=profile().name;x.proposedOutcome='Tertangani';}
      else{x.stage='Selesai';x.closedAt=t;x.result=v.result;x.evidenceRef=v.evidenceRef;}
    }
    if(action==='assignReview'){x.owner=v.owner;x.deadline=v.deadline;x.reviewAssignedAt=t;}
    if(action==='approve'){x.stage='Selesai';x.closedAt=t;x.result=x.proposedResult;x.evidenceRef=x.proposedEvidence;x.approvedBy=profile().name;x.approvedAt=t;}
    if(action==='returnWork'){x.stage=x.reviewFromStage||'Perlu konfirmasi data';x.deadline=v.deadline;if(x.proposedOutcome==='Tidak relevan'){x.signalQuality='Belum dinilai';if(earlyStage(x))x.verifiedAt='';}x.returnedAt=t;x.proposedAt='';x.proposedResult='';x.proposedEvidence='';}
    if(action==='respond'){x.stage=x.stageBeforeEscalation||'Ditugaskan';x.deadline=v.deadline;x.regionalResponse=v.note;x.regionalRespondedAt=t;if(x.lane==='B')x.responsibleRole=x.escalatedByRole||($('tkd-role').value==='Kanwil'?'PKN':'Kanwil');}
    const note=v.note||v.recommendation||v.escalationReason||v.result;
    x.notes=x.notes||[];x.notes.push({time:clockWIB(),occurredAt:t,actor:profile().name,actorRole:$('tkd-role').value,action,stage:x.stage,note:labelForAction(action,x)+' · '+v.decider+': '+note+(v.evidenceRef?' · Bukti: '+v.evidenceRef:'')});
    logChange(labelForAction(action,x)+' · '+before+' → '+x.stage,x.id,note);closeDialog();renderAll();(currentTab==='peringatan'?$('tkd-inbox-title'):$('tkd-tab-'+currentTab)).focus();toast('Tindakan tersimpan. '+(x.stage==='Selesai'?'Kasus dipindahkan ke riwayat.':'Langkah berikutnya sudah diperbarui.'));
  }

  function openRkud(id=null){
    if(!canEditSource()&&!canEditAnalysis()){toast('Metadata RKUD ditangani PKN/Kanwil.');return;}
    if(!id&&!canEditSource()){toast('Sumber baru dicatat pengampu PKN.');return;}
    const r=state.rkud.find(r=>r.id===id)||{id:'',region:'Bali',pemda:'',bank:'',period:'',received:'',validation:'Belum diverifikasi',permission:'Belum disetujui',coverage:'Belum dikonfirmasi',note:''};
    const field=(name,label,type='text',source=true)=>'<label>'+label+'<input name="'+name+'" type="'+type+'" value="'+esc(r[name]||'')+'" '+((source?!canEditSource():!canEditAnalysis())?'disabled':'')+' '+(['pemda','bank'].includes(name)?'required':'')+'></label>';
    const select=(name,label,values)=>'<label>'+label+'<select name="'+name+'" '+(!canEditSource()?'disabled':'')+'>'+options(values,r[name])+'</select></label>';
    const html='<p class="tkd-choice-note">'+(canEditSource()?'Anda mengelola metadata sumber dan izin distribusi. Penerimaan Kanwil dan penggunaan ALCo dicatat analis Kanwil.':'Anda mencatat penerimaan dan pemanfaatan analisis. Periode, cakupan, validasi serta izin sumber hanya diubah PKN.')+'</p><form class="tkd-form" id="tkd-rkud-form" data-id="'+esc(r.id)+'" data-role="'+esc($('tkd-role').value)+'" style="margin-top:.8rem"><label>Wilayah<select name="region" '+(!canEditSource()?'disabled':'')+'>'+options(regions,r.region)+'</select></label>'+field('pemda','Objek / pemda')+field('bank','Bank / sumber')+field('period','Tanggal posisi','date')+select('coverage','Kelengkapan cakupan',['Belum dikonfirmasi','Sebagian','Lengkap'])+select('validation','Validasi sumber PKN',['Belum diverifikasi','Perlu koreksi','Valid'])+select('permission','Izin distribusi',['Belum disetujui','Terbatas','Disetujui'])+field('received','Diterima PKN','date')+field('validatedAt','Validasi PKN selesai','date')+field('readyAt','Rekap siap distribusi','date')+field('kanwilAt','Diterima Kanwil','date',false)+field('alcoAt','Digunakan ALCo','date',false)+(r.analysisNeedsReview&&canEditAnalysis()?'<label class="tkd-wide tkd-checkbox"><input type="checkbox" name="reviewAck" required> Saya telah meninjau ulang perubahan sumber PKN.</label>':'')+'<label class="tkd-wide">Catatan '+profile().label+'<textarea name="note">'+esc((canEditSource()?r.sourceNote:r.analysisNote)||r.note||'')+'</textarea></label><div class="tkd-wide tkd-form-foot"><p>Metadata sumber, persetujuan akses, dan jejak distribusi.</p><button class="tkd-button" type="submit">Simpan metadata '+(canEditSource()?'PKN':'Kanwil')+'</button></div></form>';
    openDialog('Pemeriksaan informasi RKUD',profile().label+' · '+profile().name,html);
  }

    const sourceFields=['region','pemda','bank','period','received','validatedAt','readyAt','coverage','validation','permission','note'];
  const csvFields=['region','pemda','bank','period','received','validatedAt','readyAt','kanwilAt','alcoAt','validation','permission','coverage','note'];
  const normalize=value=>String(value||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('id-ID');
  const recordKey=x=>[x.region,x.pemda,x.bank,x.period].map(normalize).join('|');
  const sourceChanged=(a,b)=>['region','pemda','bank','period','received','validatedAt','readyAt','coverage','validation','permission'].some(k=>String(a[k]||'')!==String(b[k]||''));
  function validateMetadata(rec,{analyst=false}={}){
    if(rec.region!=='Bali')return 'Cakupan sumber pada modul ini adalah Provinsi Bali.';
    if(!String(rec.pemda||'').trim()||!String(rec.bank||'').trim()||!validDate(rec.period))return 'Lengkapi objek, bank/sumber, dan tanggal posisi yang valid.';
    if(!['Belum diverifikasi','Perlu koreksi','Valid'].includes(rec.validation)||!['Belum disetujui','Terbatas','Disetujui'].includes(rec.permission)||!['Belum dikonfirmasi','Sebagian','Lengkap'].includes(rec.coverage))return 'Status kualitas, cakupan atau izin tidak sesuai pilihan.';
    const dates=[rec.period,rec.received,rec.validatedAt,rec.readyAt,rec.kanwilAt,rec.alcoAt].filter(Boolean);
    if(dates.some((v,i)=>!validDate(v)||v>todayWIB()||i>0&&v<dates[i-1]))return 'Tanggal sumber harus valid, berurutan, dan tidak melewati hari ini.';
    if(rec.validation==='Valid'&&(!rec.received||!rec.validatedAt))return 'Validasi sumber memerlukan tanggal diterima dan selesai validasi PKN.';
    if(rec.readyAt&&!sourceReady(rec))return 'Kesiapan distribusi memerlukan sumber valid, cakupan lengkap, dan izin disetujui.';
    if(analyst&&(rec.kanwilAt||rec.alcoAt)&&!sourceReady(rec))return 'Lengkapi validasi, cakupan dan izin PKN sebelum mencatat penerimaan atau penggunaan.';
    if(rec.alcoAt&&!rec.kanwilAt)return 'Penggunaan ALCo memerlukan tanggal penerimaan Kanwil.';
    return '';
  }
  function handleSubmit(form){
    const v=Object.fromEntries(new FormData(form));for(const k of Object.keys(v))v[k]=v[k].trim();
    if(form.id==='tkd-case-form'){
      if(!canCreateLane(v.lane)){formError(form,'Jenis masalah ini tidak sesuai kewenangan pengguna.');return;}
      if(!v.title||!v.evidence||!v.source||!regions.includes(v.region)||!validTime(v.detectedAt)||v.detectedAt>nowWIB()){formError(form,'Lengkapi judul, fakta, sumber, wilayah dan waktu pencatatan yang valid.');return;}
      if(v.title.length>180||v.evidence.length>1500||v.source.length>200){formError(form,'Ringkas judul, fakta dan sumber sesuai batas isian.');return;}
      const transfer=v.lane==='B'?'RKUD':v.transfer;
      if(!['Dana Desa','DAK Fisik','DAK Nonfisik','DAU','DBH','RKUD','Lainnya'].includes(transfer)){formError(form,'Jenis transfer tidak sesuai pilihan.');return;}
      const duplicate=state.cases.find(x=>x.stage!=='Selesai'&&x.region===v.region&&x.lane===v.lane&&x.transfer===transfer&&normalize(x.title)===normalize(v.title));
      if(duplicate){openCase(duplicate.id);toast('Kasus sudah tercatat. Tambahkan perkembangan pada kasus yang sama.');return;}
      const id=(v.lane==='A'?'DPS-TKD-':'BALI-RKUD-')+todayWIB().slice(0,4)+'-'+crypto.randomUUID().slice(0,8).toUpperCase();
      state.cases.unshift({id,region:v.region,locality:'Kota Denpasar',lane:v.lane,dimension:v.lane==='A'?'D1':'D4a',transfer,title:v.title,evidence:v.evidence,source:v.source,origin:'Pencatatan petugas',context:'',severity:'sedang',stage:'Sinyal',owner:'',deadline:'',result:'',notes:[],updatedAt:clockWIB(),detectedAt:v.detectedAt,firstKnownAt:'',verifiedAt:'',actedAt:'',closedAt:'',decider:profile().name,evidenceRef:'',signalQuality:'Belum dinilai',responsibleRole:$('tkd-role').value});
      logChange('Catat masalah',id,v.title);closeDialog();clearFilters();switchTab('peringatan');toast('Kasus '+id+' dicatat dan masuk antrean pemeriksaan.');return;
    }
    if(form.id==='tkd-rkud-form'){
      if((!canEditSource()&&!canEditAnalysis())||form.dataset.role!==$('tkd-role').value){formError(form,'Pengguna berubah atau tidak memiliki kewenangan untuk formulir ini.');return;}
      const existing=state.rkud.find(x=>x.id===form.dataset.id);
      if(!existing&&!canEditSource()){formError(form,'Sumber baru dicatat pengampu PKN.');return;}
      const allowed=canEditSource()?sourceFields:['kanwilAt','alcoAt'];
      const rec={...(existing||{}),id:existing?.id||'RKUD-'+crypto.randomUUID().slice(0,8).toUpperCase(),...Object.fromEntries(allowed.filter(k=>k in v).map(k=>[k,v[k]]))};
      if(canEditSource()){rec.sourceNote=v.note||'';rec.note=rec.sourceNote;if(existing&&sourceChanged(existing,rec)&&(existing.kanwilAt||existing.alcoAt))rec.analysisNeedsReview=true;}
      else{rec.analysisNote=v.note||'';if(existing.analysisNeedsReview&&v.reviewAck!=='on'){formError(form,'Konfirmasikan peninjauan ulang setelah sumber PKN berubah.');return;}rec.analysisNeedsReview=false;}
      const error=validateMetadata(rec,{analyst:canEditAnalysis()});if(error){formError(form,error);return;}
      if(state.rkud.some(x=>x.id!==rec.id&&recordKey(x)===recordKey(rec))){formError(form,'Objek, bank dan periode tersebut sudah memiliki rekap. Perbarui rekap yang tersedia.');return;}
      const i=state.rkud.findIndex(x=>x.id===rec.id);if(i<0)state.rkud.push(rec);else state.rkud[i]=rec;
      logChange('Perbarui metadata '+profile().label,rec.id,rec.pemda+'; '+rec.validation+'; '+rec.permission);closeDialog();renderAll();toast('Metadata sumber dan jejak distribusi berhasil diperbarui.');return;
    }
  }
  const quoteCSV=value=>{const s=String(value??''),safe=/^\s*[=+\-@]/.test(s)?"'"+s:s;return '"'+safe.replace(/"/g,'""')+'"';};
  const toCSV=(rows,cols)=>[cols.join(','),...rows.map(x=>cols.map(k=>quoteCSV(x[k]??'')).join(','))].join('\r\n');
  function downloadText(name,text){const blob=new Blob(['\ufeff',text],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelectorAll('.tkd-download').forEach(x=>x.open=false);}
  function exportCases(){const cols=['id','region','locality','lane','dimension','transfer','title','severity','stage','source','evidence','owner','deadline','recommendation','result','detectedAt','verifiedAt','assignedAt','actedAt','proposedAt','proposedBy','proposedResult','proposedEvidence','closedAt','approvedBy','decider','evidenceRef','escalationTarget','escalationReason','regionalResponse'];downloadText('register_ews_tkd_denpasar.csv',toCSV(visibleCases(),cols));}
  function exportAudit(){const ids=new Set([...roleScope(),...sourceScope()].map(x=>x.id));downloadText('jejak_tindakan_tkd.csv',toCSV(state.audit.filter(x=>ids.has(x.ref)||!isKppn()&&x.ref==='RKUD'),['occurredAt','actor','role','action','ref','note']));}
  function exportRkud(){downloadText('metadata_rkud_bali.csv',toCSV(filteredRkud(),csvFields));}
  function downloadTemplate(){downloadText('template_metadata_rkud_bali.csv',toCSV([seed.rkud[0]],csvFields));}
  function parseCsv(text){
    const rows=[];let row=[],value='',quoted=false,closed=false;
    const data=String(text).replace(/^\ufeff/,'');
    for(let i=0;i<data.length;i++){
      const c=data[i];
      if(quoted){if(c==='"'){if(data[i+1]==='"'){value+='"';i++;}else{quoted=false;closed=true;}}else value+=c;continue;}
      if(c==='"'){if(value||closed)throw Error('Letak tanda petik CSV tidak valid.');quoted=true;continue;}
      if(c===','||c==='\r'||c==='\n'){row.push(value);value='';closed=false;if(c!==','){if(c==='\r'&&data[i+1]==='\n')i++;if(row.some(x=>x.trim()))rows.push(row);row=[];}continue;}
      if(closed&&!/\s/.test(c))throw Error('Ada karakter setelah penutup tanda petik CSV.');
      if(!closed)value+=c;
    }
    if(quoted)throw Error('Tanda petik CSV belum ditutup.');
    row.push(value);if(row.some(x=>x.trim()))rows.push(row);
    if(rows.length<2)throw Error('CSV memerlukan judul kolom dan setidaknya satu baris data.');
    const map=Object.fromEntries(csvFields.map(x=>[x.toLowerCase(),x])),rawHeader=rows.shift().map(x=>x.trim().toLowerCase());
    if(new Set(rawHeader).size!==rawHeader.length)throw Error('Judul kolom CSV tidak boleh berulang.');
    if(csvFields.some(x=>!rawHeader.includes(x.toLowerCase())))throw Error('Kolom CSV harus mengikuti templat yang disediakan.');
    const header=rawHeader.map(x=>map[x]||null);
    return rows.map((row,index)=>{if(row.length!==header.length)throw Error('Jumlah kolom tidak sesuai pada baris '+(index+2)+'.');return Object.fromEntries(header.flatMap((name,i)=>name?[[name,row[i].trim()]]:[]));});
  }
  async function importRkudFile(file){
    if(!file)return;
    if(!canEditSource()){toast('Impor sumber merupakan kewenangan PKN.');return;}
    if(file.size>100000){toast('Impor ditolak: ukuran CSV maksimum 100 KB.');return;}
    const roleAtStart=$('tkd-role').value;
    try{
      const rows=parseCsv(await file.text());if(rows.length>100)throw Error('Maksimum 100 baris per impor.');
      if(roleAtStart!==$('tkd-role').value||!canEditSource())throw Error('Pengguna berubah selama pembacaan berkas.');
      const next=copy(state.rkud),counts={added:0,updated:0,unchanged:0};
      for(const [index,row] of rows.entries()){
        const found=next.findIndex(x=>recordKey(x)===recordKey(row)),old=found<0?null:next[found];
        const rec={...(old||{}),id:old?.id||'RKUD-'+crypto.randomUUID().slice(0,8).toUpperCase(),...Object.fromEntries(sourceFields.map(k=>[k,row[k]||'']))};
        rec.sourceNote=rec.note;
        const error=validateMetadata(rec);if(error)throw Error('Baris '+(index+2)+': '+error);
        if(old&&sourceChanged(old,rec)&&(old.kanwilAt||old.alcoAt))rec.analysisNeedsReview=true;
        if(!old){next.push(rec);counts.added++;}else if(JSON.stringify(old)===JSON.stringify(rec)){counts.unchanged++;}else{next[found]=rec;counts.updated++;}
      }
      state.rkud=next;if(counts.added||counts.updated)logChange('Impor sumber RKUD','RKUD',counts.added+' baru; '+counts.updated+' diperbarui; '+counts.unchanged+' tidak berubah');
      renderAll();toast('Impor selesai: '+counts.added+' rekap baru, '+counts.updated+' diperbarui, '+counts.unchanged+' tidak berubah. Tidak ada penambahan ganda.');
    }catch(error){toast('Impor ditolak: '+error.message);}
  }

  function bindEvents(){
    document.querySelectorAll('[data-tkd-open]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();x.closest('.menu-group')?.removeAttribute('open');clearFilters();launch(x);switchTab('peringatan',{focus:true});}));
    $('tkd-page').addEventListener('click',e=>{if(e.target===$('tkd-page'))close();});
    $('tkd-page').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key!=='Tab')return;const items=[...$('tkd-page').querySelectorAll('button,input,select,summary,[tabindex="0"]')].filter(x=>!x.disabled&&x.getClientRects().length);if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus();}});
    document.querySelectorAll('[data-tkd-close]').forEach(x=>x.addEventListener('click',close));
    document.querySelectorAll('[data-tkd-tab]').forEach(x=>x.addEventListener('click',()=>switchTab(x.dataset.tkdTab)));
    document.querySelector('.tkd-tabs').addEventListener('keydown',e=>{const buttons=[...document.querySelectorAll('[data-tkd-tab]')],i=buttons.indexOf(e.target);const next=e.key==='ArrowRight'?(i+1)%3:e.key==='ArrowLeft'?(i+2)%3:e.key==='Home'?0:e.key==='End'?2:null;if(i<0||next===null)return;e.preventDefault();switchTab(buttons[next].dataset.tkdTab);buttons[next].focus();});
    $('tkd-filters').addEventListener('submit',e=>e.preventDefault());
    $('tkd-search').addEventListener('input',renderAll);$('tkd-kind').addEventListener('change',renderAll);$('tkd-status').addEventListener('change',renderAll);$('tkd-clear-filters').addEventListener('click',clearFilters);
    $('tkd-role').addEventListener('change',()=>{const wasOpen=!$('tkd-page').hidden;closeDialog();clearFilters();try{localStorage.setItem('myintress.tkd.mockUser',$('tkd-role').value);}catch{}renderAll();if(wasOpen)switchTab('peringatan');$('profile-menu').open=false;document.querySelector('#profile-menu>summary').focus();});
    document.addEventListener('click',e=>{
      const user=e.target.closest('[data-user-role]');if(user){$('tkd-role').value=user.dataset.userRole;$('tkd-role').dispatchEvent(new Event('change'));return;}
      const action=e.target.closest('[data-case-action]');if(action){openCaseAction(action.dataset.caseId,action.dataset.caseAction);return;}
      const detail=e.target.closest('[data-tkd-case]');if(detail){openCase(detail.dataset.tkdCase);return;}
      const add=e.target.closest('[data-tkd-add-case]');if(add){openNewCase(add.dataset.tkdAddCase);return;}
      const meta=e.target.closest('[data-tkd-rkud]');if(meta){openRkud(meta.dataset.tkdRkud);return;}
      const clear=e.target.closest('[data-clear-filters]');if(clear){clearFilters();return;}
      const jump=e.target.closest('[data-tkd-jump]');if(jump){if(jump.dataset.tkdJump==='rkud')$('tkd-rkud-filter').value='missing';switchTab(jump.dataset.tkdJump,{focus:true});return;}
      const kpi=e.target.closest('[data-kpi-view]');if(kpi){clearFilters();if(kpi.dataset.kpiView==='rkud')$('tkd-rkud-filter').value=kpi.dataset.kpiFilter;else $('tkd-status').value=kpi.dataset.kpiFilter;switchTab(kpi.dataset.kpiView,{focus:true});}
    });
    $('tkd-dialog-close').addEventListener('click',closeDialog);$('tkd-dialog').addEventListener('click',e=>{if(e.target===$('tkd-dialog'))closeDialog();});
    $('tkd-dialog').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeDialog();return;}if(e.key!=='Tab')return;const controls=[...$('tkd-dialog').querySelectorAll('button,input,select,textarea,summary,a[href],[tabindex="0"]')].filter(x=>!x.disabled&&x.getClientRects().length);if(e.shiftKey&&document.activeElement===controls[0]){e.preventDefault();controls.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===controls.at(-1)){e.preventDefault();controls[0].focus();}});
    $('tkd-dialog').addEventListener('submit',e=>{e.preventDefault();if(e.target.id==='tkd-action-form')saveCaseAction(e.target);else handleSubmit(e.target);});
    $('tkd-rkud-filter').addEventListener('change',renderRkud);$('tkd-add-rkud').addEventListener('click',()=>openRkud());
    $('tkd-export').addEventListener('click',exportCases);$('tkd-audit-export').addEventListener('click',exportAudit);$('tkd-rkud-export').addEventListener('click',exportRkud);$('tkd-rkud-template').addEventListener('click',downloadTemplate);
    $('tkd-rkud-file').addEventListener('change',async e=>{await importRkudFile(e.target.files[0]);e.target.value='';});
    $('ews-alert-dismiss').addEventListener('click',()=>{try{sessionStorage.setItem('myintress.tkd.dismiss.'+$('tkd-role').value,alertSignature());}catch{}$('ews-alert').hidden=true;document.querySelector('.ews-bell').focus();});
    window.addEventListener('storage',e=>{if(e.key!==STORAGE_KEY)return;state=loadState();if(!$('tkd-dialog').hidden){closeDialog();toast('Data diperbarui. Buka kembali kasus sebelum melanjutkan.');}renderAll();});
    window.addEventListener('hashchange',route);
  }
  function route(){if(!['#ews-tkd','#tkd','#ews-tkd-rkud','#ews-tkd-penyaluran','#ews-tkd-evaluasi'].includes(location.hash))return;launch();switchTab(location.hash==='#ews-tkd-rkud'?'rkud':'peringatan');}
  try{const saved=localStorage.getItem('myintress.tkd.mockUser');if(USER_PROFILES[saved])$('tkd-role').value=saved;}catch{}
  bindEvents();renderAll();route();persist();
})();
