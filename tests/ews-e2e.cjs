/* No npm dependencies. Uses an isolated Chromium profile, local HTTP server and CDP. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),net=require('node:net'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.TKD_AUDIT_DIR||path.join(os.tmpdir(),'myintress-tkd-audit'));
const chrome=[process.env.CHROME_BIN,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/usr/bin/chromium','/usr/bin/google-chrome'].find(x=>x&&fs.existsSync(x));
if(!chrome)throw Error('Set CHROME_BIN to an installed Chromium browser.');
fs.mkdirSync(out,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'myintress-qa-')),server=http.createServer((req,res)=>{try{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname)),target=fs.existsSync(file)&&fs.statSync(file).isDirectory()?path.join(file,'index.html'):file;if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.end(fs.readFileSync(target));}catch{res.writeHead(404);res.end();}});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let browser,ws,call,serverUrl;const results=[],runtimeErrors=[],layouts=[],metrics={};
const assert=(name,ok,evidence)=>{results.push({name,pass:!!ok,...(evidence===undefined?{}:{evidence})});if(!ok)throw Error('FAIL: '+name+' '+JSON.stringify(evidence??''));};
async function ev(fn,...args){const expression=typeof fn==='function'?'('+fn.toString()+')(...'+JSON.stringify(args)+')':fn;const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(predicate){for(let i=0;i<100;i++){if(await predicate())return;await delay(50);}throw Error('Timed out waiting for browser state');}
async function helpers(){await ev(()=>{
 window.qa={
  $:s=>document.querySelector(s),data:()=>JSON.parse(localStorage.getItem(window.MYINTRESS_TKD_SEED.key)),
  user(role){if(!this.$('#tkd-dialog').hidden)this.$('#tkd-dialog-close').click();if(!this.$('#tkd-page').hidden)this.$('[data-tkd-close]').click();this.$('#profile-menu').open=true;this.$('[data-user-role="'+role+'"]').click();},
  popup(){this.$('.ews-bell').click();},
  tab(name){this.$('[data-tkd-tab="'+name+'"]').click();},
  detail(id){this.tab('register');this.$('#tkd-cases-all [data-tkd-case="'+id+'"]').click();},
  action(id,name){this.tab('register');const primary=this.$('#tkd-cases-all [data-case-id="'+id+'"][data-case-action="'+name+'"]');if(primary){primary.click();return;}this.$('#tkd-cases-all [data-tkd-case="'+id+'"]').click();this.$('#tkd-dialog [data-case-action="'+name+'"]').click();},
  save(values){const f=this.$('#tkd-action-form');for(const [key,value]of Object.entries(values)){const input=f.elements.namedItem(key);if(input.type==='checkbox')input.checked=value;else input.value=value;}f.requestSubmit();},
  current(id){return this.data().cases.find(x=>x.id===id);},
  target:new Date(Date.now()+10*86400000).toISOString().slice(0,10),
  now:new Date(Date.now()+7*3600000).toISOString().slice(0,16),
  async import(text){const input=this.$('#tkd-rkud-file');Object.defineProperty(input,'files',{configurable:true,value:[new File([text],'source.csv',{type:'text/csv'})]});input.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,100));}
 };
});}
async function reset(){await ev(()=>{const seed=window.MYINTRESS_TKD_SEED;localStorage.setItem(seed.key,JSON.stringify({version:seed.version,cases:seed.cases,rkud:seed.rkud,audit:[]}));localStorage.setItem('myintress.tkd.mockUser','KPPN');sessionStorage.clear();});await call('Page.reload');await until(()=>ev(()=>document.readyState==='complete'&&!!document.querySelector('#tkd-title')&&document.querySelector('#header-user-role').textContent==='Petugas KPPN'));await helpers();}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));serverUrl='http://127.0.0.1:'+server.address().port+'/';
 const portServer=net.createServer();await new Promise(r=>portServer.listen(0,'127.0.0.1',r));const port=portServer.address().port;await new Promise(r=>portServer.close(r));
 browser=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port='+port,'--user-data-dir='+path.join(temp,'profile'),'about:blank'],{windowsHide:true,stdio:'ignore'});
 let tabs;for(let i=0;i<100;i++){try{tabs=await(await fetch('http://127.0.0.1:'+port+'/json')).json();if(tabs.some(x=>x.type==='page'))break;}catch{}await delay(100);}
 if(!tabs)throw Error('Chromium did not start');ws=new WebSocket(tabs.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let sequence=0;const pending=new Map();
 ws.onmessage=e=>{const msg=JSON.parse(e.data);if(msg.method==='Runtime.exceptionThrown')runtimeErrors.push(msg.params.exceptionDetails);if(msg.id){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p?.reject(Error(JSON.stringify(msg.error))):p?.resolve(msg.result);}};
 call=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 await call('Runtime.enable');await call('Page.enable');await call('Network.enable');await call('Network.setBlockedURLs',{urls:['https://*']});
 await call('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:path.join(temp,'downloads')});
 await call('Page.navigate',{url:serverUrl});await until(()=>ev(()=>document.readyState==='complete'&&!!window.MYINTRESS_TKD_SEED&&document.querySelector('#header-user-role').textContent==='Petugas KPPN'));await helpers();await reset();
 assert('No duplicate IDs',await ev(()=>{const a=[...document.querySelectorAll('[id]')].map(x=>x.id);return new Set(a).size===a.length;}));
 assert('Accessibility dashboard heading stays hidden without CDN styles',await ev(()=>{const e=document.querySelector('.dashboard-main>h1'),r=e.getBoundingClientRect();return e.textContent==='Dasbor MyIntress'&&getComputedStyle(e).position==='absolute'&&r.width<=1&&r.height<=1;}));
 assert('Exactly four direct user choices, no user select',await ev(()=>document.querySelectorAll('[data-user-role]').length===4&&!document.querySelector('select#tkd-role')));
 assert('Exactly three EWS views; no retired FA or pilot menus',await ev(()=>document.querySelectorAll('.tkd-tabs [role=tab]').length===3&&!document.querySelector('#ews-modal,#tkd-view-pilot,#tkd-view-penyaluran')));
 assert('One Tematik entry',await ev(()=>[...document.querySelectorAll('.menu-group')].find(x=>x.querySelector('summary').textContent==='Tematik').querySelectorAll('[data-tkd-open]').length===1));
 await ev(()=>{qa.user('KepalaKPPN');});assert('Choosing user does not open a new module',await ev(()=>qa.$('#tkd-page').hidden&&qa.$('#header-user-role').textContent==='Kepala KPPN'));
 await ev(()=>{qa.user('KPPN');qa.popup();});
 assert('EWS is modal over visible dashboard',await ev(()=>!qa.$('#tkd-page').hidden&&qa.$('#tkd-page').getAttribute('role')==='dialog'&&!qa.$('.dashboard-main').hidden&&qa.$('.dashboard-main').inert));
 assert('Shared MyIntress accent color',await ev(()=>getComputedStyle(qa.$('[data-tkd-tab=peringatan]')).backgroundColor===getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||getComputedStyle(qa.$('[data-tkd-tab=peringatan]')).backgroundColor==='rgb(66, 77, 184)'));
 assert('First task follows nearest target',await ev(()=>qa.$('#tkd-inbox-cases article').dataset.caseRecord==='DPS-TKD-2026-012'));
 assert('Each visible case rendered once',await ev(()=>{const a=[...document.querySelectorAll('[data-case-record]')].map(x=>x.dataset.caseRecord);return new Set(a).size===a.length;}));
 await ev(()=>{qa.$('#tkd-search').value='wulandari';qa.$('#tkd-search').dispatchEvent(new Event('input'));});
 assert('Search includes PIC',await ev(()=>qa.$('#tkd-inbox-cases article')!==null));
 await ev(()=>{qa.$('#tkd-search').value='no-match-xyz';qa.$('#tkd-search').dispatchEvent(new Event('input'));});
 assert('Filtered empty state does not claim all tasks resolved',await ev(()=>qa.$('#tkd-inbox-cases').textContent.includes('filter')&&!qa.$('#tkd-inbox-cases').textContent.includes('sudah ditangani')));
 assert('Global alert count unaffected by search',await ev(()=>qa.$('#tkd-task-count').textContent==='2'));
 await ev(()=>qa.$('#tkd-clear-filters').click());
 await ev(()=>qa.$('#tkd-inbox-cases [data-case-action=progress]').click());
 assert('Primary task opens the relevant short form in one click',await ev(()=>qa.$('#tkd-action-form').dataset.action==='progress'&&!qa.$('#tkd-dialog select[name=stage]')));
 assert('Nested action dialog keeps EWS inert',await ev(()=>qa.$('#tkd-page').inert));
 await ev(()=>qa.$('#tkd-dialog-close').click());
 assert('Closing action restores popup, keeps body locked',await ev(()=>!qa.$('#tkd-page').inert&&document.body.style.overflow==='hidden'));
 await ev(()=>qa.$('[data-tkd-close]').click());
 assert('Closing EWS restores dashboard and focus',await ev(()=>!qa.$('.site-header').inert&&!qa.$('.dashboard-main').inert&&document.body.style.overflow===''&&document.activeElement===qa.$('.ews-bell')));
 // Full four-role workflow, including handback and approval.
 await ev(()=>{qa.popup();qa.$('[data-tkd-add-case]').click();const f=qa.$('#tkd-case-form');f.elements.title.value='Pemeriksaan alur menyeluruh';f.elements.evidence.value='Bukti pemeriksaan terstruktur';f.elements.source.value='Register audit 11 November 2026';f.requestSubmit();window.caseId=qa.data().cases[0].id;});
 const id=await ev(()=>window.caseId);
 assert('New case created once',await ev(id=>qa.current(id).stage==='Sinyal',id));
 await ev(id=>qa.action(id,'confirm'),id);
 await ev(()=>{qa.$('#tkd-action-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
 assert('Blank verification rejected inline',await ev(id=>qa.current(id).stage==='Sinyal'&&qa.$('#tkd-action-error').textContent.length>0,id));
 await ev(()=>qa.save({note:'Sumber dan pengecualian telah diperiksa',occurredAt:'2026-01-01T09:00'}));
 assert('Backdated action rejected',await ev(id=>qa.current(id).stage==='Sinyal',id));
 await ev(()=>qa.save({occurredAt:'2099-01-01T09:00'}));
 assert('Future action rejected',await ev(id=>qa.current(id).stage==='Sinyal',id));
 await ev(()=>qa.save({occurredAt:qa.now}));
 assert('Verified case routed out of petugas queue',await ev(id=>qa.current(id).stage==='Terverifikasi'&&!qa.$('#tkd-inbox-cases [data-case-record="'+id+'"]'),id));
 assert('Verification receipt names chief and pending decision',await ev(()=>!qa.$('#tkd-outcome').hidden&&qa.$('#tkd-outcome').textContent.includes('Kepala KPPN')&&qa.$('#tkd-outcome').textContent.includes('Penetapan PIC')));
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
 assert('Mobile receipt fits and receives keyboard focus',await ev(()=>{const b=qa.$('#tkd-outcome'),r=b.getBoundingClientRect();return document.activeElement===b&&r.left>=0&&r.right<=innerWidth&&b.scrollWidth<=b.clientWidth+1;}));
 fs.writeFileSync(path.join(out,'hasil-verifikasi-390.png'),Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await call('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
 await ev(id=>{qa.user('KPPN');qa.popup();qa.detail(id);},id);
 assert('Petugas cannot assign own verified case',await ev(()=>!qa.$('#tkd-dialog [data-case-action=plan]')));
 await ev(id=>{qa.user('KepalaKPPN');qa.popup();qa.action(id,'plan');qa.save({owner:'Ni Putu Wulandari',deadline:qa.target,recommendation:'Klarifikasi dokumen ke pengampu'});},id);
 assert('Assignment records no fictional first action',await ev(id=>qa.current(id).stage==='Ditugaskan'&&qa.current(id).assignedAt&&!qa.current(id).actedAt,id));
 assert('Assignment receipt returns work to assigned petugas',await ev(()=>qa.$('#tkd-outcome').textContent.includes('Ni Putu Wulandari')&&qa.$('#tkd-outcome').textContent.includes('Pelaksanaan rencana')));
 await ev(id=>{qa.user('KPPN');qa.popup();qa.action(id,'progress');qa.save({note:'Klarifikasi dilaksanakan dan respons diterima',deadline:qa.target});},id);
 assert('Actual progress has petugas actor',await ev(id=>qa.current(id).stage==='Ditindaklanjuti'&&qa.current(id).actedAt&&qa.current(id).notes.at(-1).actor==='Ni Putu Wulandari',id));
 await ev(id=>qa.action(id,'escalate'),id);
 assert('Petugas escalation only to chief',await ev(()=>[...qa.$('#tkd-action-form').elements.escalationTarget.options].filter(x=>x.value).map(x=>x.value).join()==='Kepala KPPN'));
 await ev(()=>qa.save({escalationTarget:'Kepala KPPN',deadline:qa.target,escalationReason:'Memerlukan arahan lintas unit'}));
 assert('Petugas support receipt names chief, not Kanwil',await ev(()=>qa.$('#tkd-outcome').textContent.includes('Kepala KPPN')&&!qa.$('#tkd-outcome').textContent.includes('Analis Kanwil')));
 await ev(id=>{qa.user('KepalaKPPN');qa.popup();qa.action(id,'escalate');qa.save({escalationTarget:'Kanwil DJPb',deadline:qa.target,escalationReason:'Memerlukan konsolidasi regional'});},id);
 assert('Chief forwards to an available role, no dead-end central target',await ev(id=>qa.current(id).escalationTarget==='Kanwil DJPb',id));
 assert('Chief support receipt names Bali analyst',await ev(()=>qa.$('#tkd-outcome').textContent.includes('Analis Kanwil')&&qa.$('#tkd-outcome').textContent.includes('Ni Kadek Maharani')));
 await ev(id=>{qa.user('Kanwil');qa.popup();qa.action(id,'respond');qa.save({note:'Arahan konsolidasi diberikan',deadline:qa.target});},id);
 assert('Kanwil response returns case to implementation',await ev(id=>qa.current(id).stage==='Ditindaklanjuti'&&!!qa.current(id).regionalResponse,id));
 assert('Regional response receipt names implementing petugas',await ev(()=>qa.$('#tkd-outcome').textContent.includes('Petugas KPPN')&&qa.$('#tkd-outcome').textContent.includes('Ni Putu Wulandari')));
 await ev(id=>{qa.user('KPPN');qa.popup();qa.tab('register');qa.$('#tkd-search').value=id;qa.$('#tkd-search').dispatchEvent(new Event('input'));},id);
 assert('Returning petugas sees latest Kanwil instruction on case card',await ev(()=>qa.$('#tkd-cases-all article .tkd-work-next').textContent.includes('Arahan konsolidasi diberikan')));
 await ev(id=>{qa.user('KPPN');qa.popup();qa.action(id,'finish');qa.save({result:'Perbaikan dokumen lengkap',evidenceRef:'BA-AUDIT-01'});},id);
 assert('Petugas proposal is not final closure',await ev(id=>qa.current(id).stage==='Menunggu persetujuan'&&!qa.current(id).closedAt,id));
 assert('Closure proposal receipt awaits evidence approval',await ev(()=>qa.$('#tkd-outcome').textContent.includes('Kepala KPPN')&&qa.$('#tkd-outcome').textContent.includes('Pemeriksaan hasil dan bukti')));
 await ev(id=>{qa.user('KepalaKPPN');qa.popup();qa.action(id,'returnWork');},id);
 assert('Direct review form includes proposed evidence',await ev(()=>qa.$('#tkd-dialog-content').textContent.includes('BA-AUDIT-01')));
 await ev(()=>qa.save({note:'Lengkapi respons terakhir',deadline:qa.target}));
 assert('Chief can return proposal',await ev(id=>qa.current(id).stage==='Ditindaklanjuti'&&!qa.current(id).proposedAt,id));
 await ev(id=>{qa.user('KPPN');qa.popup();qa.tab('register');qa.$('#tkd-search').value=id;qa.$('#tkd-search').dispatchEvent(new Event('input'));},id);
 assert('Returned work shows new correction instruction instead of old regional advice',await ev(()=>{const t=qa.$('#tkd-cases-all article .tkd-work-next').textContent;return t.includes('Lengkapi respons terakhir')&&!t.includes('Arahan konsolidasi diberikan');}));
 await ev(()=>{const original=URL.createObjectURL;URL.createObjectURL=blob=>{window.exportBlob=blob;return original(blob);};qa.$('#tkd-export').click();});
 const caseExport=await ev(()=>window.exportBlob.text());
 assert('Register export preserves latest correction instruction and impact column',caseExport.includes('nextInstruction')&&caseExport.includes('impact')&&caseExport.includes('Lengkapi respons terakhir'));
 await ev(id=>{qa.user('KPPN');qa.popup();qa.action(id,'finish');qa.save({result:'Respons dan bukti telah lengkap',evidenceRef:'BA-AUDIT-02'});qa.user('KepalaKPPN');qa.popup();qa.action(id,'approve');qa.save({note:'Hasil dan bukti disetujui'});},id);
 assert('Closure requires chief and preserves proof',await ev(id=>qa.current(id).stage==='Selesai'&&qa.current(id).approvedBy==='I Made Pranata'&&qa.current(id).evidenceRef==='BA-AUDIT-02',id));
 assert('Closure receipt does not claim money was spent',await ev(()=>qa.$('#tkd-outcome').textContent.includes('penanganan kasus ditutup')||qa.$('#tkd-outcome').textContent.includes('Penanganan kasus ditutup')));
 await ev(id=>qa.detail(id),id);assert('Finished case is read-only',await ev(()=>!qa.$('#tkd-dialog [data-case-action]')));
 assert('Case separates disbursement, APBD expenditure and resolution',await ev(()=>{const t=qa.$('.tkd-fiscal-context').textContent;return t.includes('Penyaluran TKD')&&t.includes('Belanja APBD')&&t.includes('Penanganan masalah')&&t.includes('Belum dikonfirmasi')&&t.includes('bukan bukti dana sudah disalurkan');}));
 await ev(()=>{qa.user('KPPN');qa.popup();qa.action('DPS-TKD-2026-011','reject');qa.save({note:'Pemicu tidak sesuai hasil pemeriksaan',evidenceRef:'BA-KOREKSI-01'});qa.user('KepalaKPPN');qa.popup();qa.action('DPS-TKD-2026-011','returnWork');qa.save({note:'Periksa kembali sumber',deadline:qa.target});});
 assert('Returned irrelevant signal requires verification again',await ev(()=>qa.current('DPS-TKD-2026-011').stage==='Sinyal'&&!qa.current('DPS-TKD-2026-011').verifiedAt));
 await ev(()=>{qa.user('KPPN');qa.popup();qa.action('DPS-TKD-2026-011','reject');qa.save({note:'Dikonfirmasi tidak relevan',evidenceRef:'BA-KOREKSI-02'});qa.user('KepalaKPPN');qa.popup();qa.action('DPS-TKD-2026-011','approve');qa.save({note:'Koreksi dikonfirmasi'});});
 assert('False-positive closure never invents field action',await ev(()=>qa.current('DPS-TKD-2026-011').stage==='Selesai'&&!qa.current('DPS-TKD-2026-011').actedAt));
 // Metadata ownership, validation and downstream correction.
 await reset();await ev(()=>{qa.user('PKN');qa.popup();qa.$('[data-tkd-jump=rkud]').click();qa.$('[data-tkd-rkud="RKUD-DPS-202610-02"]').click();});
 assert('PKN cannot edit analyst receipt dates',await ev(()=>qa.$('#tkd-rkud-form').elements.kanwilAt.disabled));
 await ev(()=>{const f=qa.$('#tkd-rkud-form');f.elements.validation.value='Valid';f.elements.coverage.value='Lengkap';f.elements.permission.value='Disetujui';f.requestSubmit();});
 assert('Valid source requires actual validation dates',await ev(()=>!qa.$('#tkd-dialog').hidden&&qa.$('#tkd-rkud-form [role=alert]').textContent.includes('tanggal')));
 await ev(()=>{const f=qa.$('#tkd-rkud-form');f.elements.validatedAt.value='2026-11-05';f.elements.readyAt.value='2026-11-06';f.elements.kanwilAt.disabled=false;f.elements.kanwilAt.value='2026-11-08';f.requestSubmit();});
 assert('Forged analyst field ignored in PKN save',await ev(()=>!qa.data().rkud.find(x=>x.id==='RKUD-DPS-202610-02').kanwilAt));
 assert('Ready source receipt awaits Kanwil receipt',await ev(()=>qa.$('#tkd-outcome').textContent.includes('Analis Kanwil')&&qa.$('#tkd-outcome').textContent.includes('Pencatatan penerimaan')));
 await ev(()=>{qa.user('Kanwil');qa.popup();qa.$('[data-tkd-jump=rkud]').click();qa.$('[data-tkd-rkud="RKUD-DPS-202610-02"]').click();});
 assert('Analyst cannot edit source validation',await ev(()=>qa.$('#tkd-rkud-form').elements.validation.disabled));
 await ev(()=>{const f=qa.$('#tkd-rkud-form');f.elements.validation.disabled=false;f.elements.validation.value='Perlu koreksi';f.elements.kanwilAt.value='2026-11-08';f.elements.alcoAt.value='2026-11-10';f.elements.note.value='Sudah digunakan dalam analisis';f.requestSubmit();});
 assert('Source validation remains authoritative',await ev(()=>qa.data().rkud.find(x=>x.id==='RKUD-DPS-202610-02').validation==='Valid'));
 await ev(()=>{qa.user('PKN');qa.popup();qa.$('[data-tkd-jump=rkud]').click();qa.$('#tkd-rkud-filter').value='all';qa.$('#tkd-rkud-filter').dispatchEvent(new Event('change'));qa.$('[data-tkd-rkud="RKUD-DPS-202610-02"]').click();const f=qa.$('#tkd-rkud-form');f.elements.note.value='Catatan sumber PKN';f.elements.bank.value='Bank BPD Bali • rekonsiliasi';f.requestSubmit();});
 assert('Source correction flags downstream review',await ev(()=>qa.data().rkud.find(x=>x.id==='RKUD-DPS-202610-02').analysisNeedsReview===true));
 assert('Source correction receipt requests renewed analyst review',await ev(()=>qa.$('#tkd-outcome').textContent.includes('Peninjauan ulang Kanwil')));
 await ev(()=>{qa.user('Kanwil');qa.popup();qa.$('[data-tkd-jump=rkud]').click();qa.$('[data-tkd-rkud="RKUD-DPS-202610-02"]').click();});
 assert('Analyst explicitly acknowledges revised source',await ev(()=>!!qa.$('#tkd-rkud-form').elements.reviewAck));
 await ev(()=>{const f=qa.$('#tkd-rkud-form');f.elements.reviewAck.checked=true;f.elements.note.value='Analisis diperiksa ulang';f.requestSubmit();});
 assert('Analyst note does not overwrite source note',await ev(()=>{const r=qa.data().rkud.find(x=>x.id==='RKUD-DPS-202610-02');return r.sourceNote==='Catatan sumber PKN'&&r.analysisNote==='Analisis diperiksa ulang'&&!r.analysisNeedsReview;}));
 await ev(()=>{qa.user('PKN');qa.popup();qa.$('[data-tkd-jump=rkud]').click();qa.$('#tkd-rkud-filter').value='all';qa.$('#tkd-rkud-filter').dispatchEvent(new Event('change'));qa.$('[data-tkd-rkud="RKUD-DPS-202610-02"]').click();qa.$('#tkd-rkud-form').requestSubmit();const original=URL.createObjectURL;URL.createObjectURL=blob=>{window.staleReceiptCsv=blob;return original(blob);};qa.$('#tkd-rkud-export').click();});
 assert('Metadata save shows receipt before importing',await ev(()=>!qa.$('#tkd-outcome').hidden));
 await ev(async()=>qa.import(await window.staleReceiptCsv.text()));
 assert('Successful import clears stale save receipt',await ev(()=>qa.$('#tkd-outcome').hidden));
 await reset();await ev(()=>{qa.user('Kanwil');qa.popup();qa.tab('register');});
 assert('Read-only KPPN alert tells analyst who must verify',await ev(()=>{const c=qa.$('[data-case-record="DPS-TKD-2026-011"]');return c.querySelector('.tkd-work-next').textContent.includes('Menunggu Petugas KPPN')&&!c.querySelector('[data-case-action]');}));
 assert('Read-only verified source tells analyst to wait for PKN',await ev(()=>qa.$('[data-case-record="BALI-RKUD-2026-022"] .tkd-work-next').textContent.includes('Menunggu Pengampu PKN')));
 await ev(()=>{qa.user('KepalaKPPN');qa.popup();qa.tab('register');});
 assert('Chief early-stage instruction matches assignment authority',await ev(()=>{const c=qa.$('[data-case-record="DPS-TKD-2026-011"]');return c.querySelector('.tkd-work-next').textContent.includes('Tetapkan petugas')&&c.querySelector('[data-case-action=assignReview]');}));
 // CSV round-trip through actual export and file-input handlers.
 await reset();await ev(()=>{qa.user('PKN');qa.popup();qa.$('[data-tkd-jump=rkud]').click();qa.$('#tkd-rkud-filter').value='all';qa.$('#tkd-rkud-filter').dispatchEvent(new Event('change'));const original=URL.createObjectURL;URL.createObjectURL=blob=>{window.exportBlob=blob;return original(blob);};qa.$('#tkd-rkud-template').click();});
 const csv=await ev(()=>window.exportBlob.text());
 assert('Export has canonical camel-case fields',csv.includes('validatedAt')&&csv.includes('kanwilAt'));
 await ev(csv=>qa.import(csv),csv);
 assert('Downloaded template can be imported',await ev(()=>!qa.$('#tkd-toast').textContent.includes('ditolak')),await ev(()=>qa.$('#tkd-toast').textContent));
 const n=await ev(()=>qa.data().rkud.length);
 await ev(csv=>qa.import(csv),csv);
 assert('Repeated import is idempotent',await ev(n=>qa.data().rkud.length===n,n));
 const special=await ev(()=>{const fields=['region','pemda','bank','period','received','validatedAt','readyAt','kanwilAt','alcoAt','validation','permission','coverage','note'];const record={...window.MYINTRESS_TKD_SEED.rkud[0],pemda:'Objek Audit CSV',note:'Catatan, dengan "kutipan"\ndan baris baru'};const q=x=>'"'+String(x??'').replace(/"/g,'""')+'"';return fields.join(',')+'\r\n'+fields.map(k=>q(record[k])).join(',');});
 await ev(csv=>qa.import(csv),special);
 assert('CSV commas, escaped quotes and newlines survive import',await ev(()=>qa.data().rkud.find(x=>x.pemda==='Objek Audit CSV').note==='Catatan, dengan "kutipan"\ndan baris baru'));
 const withSpecial=await ev(()=>qa.data().rkud.length);await ev(csv=>qa.import(csv),special);
 assert('New CSV source is also idempotent',await ev(n=>qa.data().rkud.length===n,withSpecial));
 const atomic=special.replace('Objek Audit CSV','Sumber Atomik')+'\r\n'+special.split('\r\n').slice(1).join('\r\n').replace('Objek Audit CSV','Sumber Rusak').replace('2026-10-31','2026-02-31');
 await ev(csv=>qa.import(csv),atomic);
 assert('Invalid second record does not partially commit first record',await ev(n=>qa.data().rkud.length===n&&!qa.data().rkud.some(x=>x.pemda==='Sumber Atomik'),withSpecial));
 await reset();await ev(()=>{qa.user('PKN');qa.popup();qa.$('[data-tkd-jump=rkud]').click();qa.$('#tkd-rkud-filter').value='all';qa.$('#tkd-rkud-filter').dispatchEvent(new Event('change'));const original=URL.createObjectURL;URL.createObjectURL=blob=>{window.exportBlob=blob;return original(blob);};});
 const bad=csv.replace('2026-10-31','2026-02-31');await ev(csv=>qa.import(csv),bad);
 assert('Invalid calendar date rejects batch',await ev(n=>qa.data().rkud.length===n&&qa.$('#tkd-toast').textContent.includes('ditolak'),n));
 const rows=csv.replace(/^\ufeff/,'').split('\r\n');const duplicate=rows[0]+'\r\n'+rows[1]+'\r\n'+rows[1];await ev(csv=>qa.import(csv),duplicate);
 assert('Duplicate rows do not add duplicate rekap',await ev(n=>qa.data().rkud.length===n,n));
 await ev(()=>{qa.$('#tkd-rkud-export').click();});const exported=await ev(()=>window.exportBlob.text());
 assert('CSV export includes current rekap exactly once',exported.split('\r\n').length===n+1);
 await ev(()=>qa.$('#tkd-add-rkud').click());
 await ev(()=>{const f=qa.$('#tkd-rkud-form');f.elements.pemda.value='Pemerintah Kota Denpasar';f.elements.bank.value='Bank BPD Bali';f.elements.period.value='2026-10-31';f.requestSubmit();});
 assert('Manual source form rejects an existing natural key',await ev(n=>qa.data().rkud.length===n&&qa.$('#tkd-rkud-form [role=alert]').textContent.includes('sudah'),n));
 // KPI drilldown, priority clock and role handover for source issues.
 await reset();await ev(()=>{qa.user('KepalaKPPN');qa.popup();qa.tab('ikhtisar');qa.$('[data-kpi-filter=approval]').click();});
 assert('KPI drills directly into corresponding cases',await ev(()=>qa.$('#tkd-status').value==='approval'&&qa.$('#tkd-cases-all article').textContent.includes('menunggu persetujuan')));
 await ev(()=>{qa.tab('peringatan');qa.$('[data-tkd-close]').click();qa.$('#menu-toggle').click();qa.$('#menu-search').value='TKD';qa.$('#menu-search').dispatchEvent(new Event('input'));qa.$('.menu-group [data-tkd-open]').click();});
 assert('Tematik entry opens same popup',await ev(()=>!qa.$('#tkd-page').hidden&&document.querySelectorAll('#tkd-page').length===1));
 await reset();await ev(()=>{const seed=window.MYINTRESS_TKD_SEED,s=qa.data();s.cases[1].deadline='2026-01-01';localStorage.setItem(seed.key,JSON.stringify(s));window.dispatchEvent(new StorageEvent('storage',{key:seed.key}));qa.popup();});
 assert('Overdue target receives highest priority',await ev(()=>qa.$('#tkd-inbox-cases article .tkd-high').textContent.includes('Terlambat')));
 await reset();await ev(()=>{const seed=window.MYINTRESS_TKD_SEED,s=qa.data();s.cases=s.cases.filter(x=>x.lane==='A').slice(0,2).map((x,i)=>({...x,id:'PRIORITAS-'+i,stage:'Sinyal',deadline:qa.target,severity:i?'tinggi':'rendah'}));localStorage.setItem(seed.key,JSON.stringify(s));window.dispatchEvent(new StorageEvent('storage',{key:seed.key}));qa.popup();});
 assert('High impact outranks low impact with same target',await ev(()=>qa.$('#tkd-inbox-cases article').dataset.caseRecord==='PRIORITAS-1'));
 assert('Alert shows location, transfer, impact and next action without opening details',await ev(()=>{const c=qa.$('#tkd-inbox-cases article');return c.querySelector('.tkd-location').textContent.includes('Kota Denpasar')&&c.querySelector('.tkd-impact').textContent.includes('Dampak tinggi')&&c.querySelector('.tkd-work-next')&&!c.querySelector('details').open;}));
 await ev(()=>{qa.$('#tkd-inbox-cases [data-case-action=confirm]').click();qa.save({note:'Fakta telah diperiksa'});qa.$('[data-dismiss-outcome]').click();});
 assert('Receipt can be dismissed without changing workflow',await ev(()=>qa.$('#tkd-outcome').hidden&&qa.data().cases.find(x=>x.id==='PRIORITAS-1').stage==='Terverifikasi'));
 await ev(()=>{qa.user('KepalaKPPN');qa.popup();});assert('Changing role does not show previous user receipt',await ev(()=>qa.$('#tkd-outcome').hidden));
 await reset();await ev(()=>{qa.user('PKN');qa.popup();qa.action('BALI-RKUD-2026-021','confirm');qa.save({note:'Sumber diperiksa'});qa.action('BALI-RKUD-2026-021','plan');qa.save({owner:'Rizky Pratama',deadline:qa.target,recommendation:'Rekonsiliasi sumber'});qa.action('BALI-RKUD-2026-021','escalate');qa.save({deadline:qa.target,escalationTarget:'Kanwil DJPb',escalationReason:'Memerlukan konfirmasi kebutuhan analisis'});});
 assert('Source request waits for recipient role',await ev(()=>!qa.$('#tkd-inbox-cases [data-case-record="BALI-RKUD-2026-021"]')));
 await ev(()=>{qa.user('Kanwil');qa.popup();qa.action('BALI-RKUD-2026-021','respond');qa.save({note:'Kebutuhan periodisasi telah dijelaskan',deadline:qa.target});qa.user('PKN');qa.popup();});
 assert('RKUD response returns to requesting role',await ev(()=>!!qa.$('#tkd-inbox-cases [data-case-record="BALI-RKUD-2026-021"]')));
 // Persistence, keyboard and responsiveness.
 for(const [role,id,action]of [['KPPN','DPS-TKD-2026-011','confirm'],['KepalaKPPN','DPS-TKD-2026-013','plan'],['Kanwil','DPS-TKD-2026-015','respond'],['PKN','BALI-RKUD-2026-021','confirm']]){
  await reset();await ev(([role,id,action])=>{qa.user(role);qa.popup();qa.action(id,action);},[role,id,action]);
  for(const [width,height]of [[1366,768],[390,844],[320,700]]){
   await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
   assert('Action form fits '+role+' '+width,await ev(()=>{const d=qa.$('.tkd-dialog'),r=d.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&d.scrollWidth<=d.clientWidth+1;}));
   assert('Save button reachable '+role+' '+width,await ev(()=>{const b=qa.$('#tkd-action-form [type=submit]');b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth;}));
  }
 }
 await reset();await ev(()=>{qa.user('PKN');qa.popup();qa.action('BALI-RKUD-2026-021','confirm');qa.save({note:'Sumber diperiksa'});qa.action('BALI-RKUD-2026-021','plan');qa.save({owner:'Rizky Pratama',deadline:qa.target,recommendation:'Rekonsiliasi sumber'});qa.action('BALI-RKUD-2026-021','escalate');qa.save({deadline:qa.target,escalationTarget:'Kanwil DJPb',escalationReason:'Memerlukan konfirmasi kebutuhan analisis'});qa.user('Kanwil');qa.popup();qa.action('BALI-RKUD-2026-021','respond');qa.save({note:'Kebutuhan periodisasi telah dijelaskan',deadline:qa.target});qa.user('PKN');qa.popup();});
 await call('Page.reload');await until(()=>ev(()=>document.readyState==='complete'&&document.querySelector('#header-user-role').textContent==='Pengampu PKN'));await helpers();
 assert('User and workflow survive reload',await ev(()=>qa.data().cases.find(x=>x.id==='BALI-RKUD-2026-021').regionalResponse==='Kebutuhan periodisasi telah dijelaskan'));
 await ev(()=>{qa.popup();qa.$('[data-tkd-tab=peringatan]').focus();qa.$('[data-tkd-tab=peringatan]').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));});
 assert('Tabs support keyboard navigation',await ev(()=>!qa.$('#tkd-view-register').hidden&&qa.$('[data-tkd-tab=register]').tabIndex===0));
 await ev(()=>qa.$('[data-tkd-close]').focus());await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',modifiers:8});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',modifiers:8});
 assert('Popup traps keyboard focus',await ev(()=>qa.$('#tkd-page').contains(document.activeElement)));
 await ev(()=>document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
 assert('Escape closes EWS and restores dashboard',await ev(()=>qa.$('#tkd-page').hidden&&!qa.$('.dashboard-main').inert));
 await reset();
 await ev(()=>{qa.$('#ews-alert-dismiss').click();qa.popup();qa.$('[data-tkd-add-case]').click();const f=qa.$('#tkd-case-form');f.elements.title.value='Peringatan baru setelah banner ditutup';f.elements.evidence.value='Fakta peringatan baru';f.elements.source.value='Register baru';f.requestSubmit();});
 assert('New task resurfaces a previously dismissed banner',await ev(()=>!qa.$('#ews-alert').hidden));
 const duplicateCount=await ev(()=>qa.data().cases.length);
 await ev(()=>{qa.$('[data-tkd-add-case]').click();const f=qa.$('#tkd-case-form');f.elements.title.value='  PERINGATAN BARU   SETELAH BANNER DITUTUP  ';f.elements.evidence.value='Fakta tambahan';f.elements.source.value='Sumber tambahan';f.requestSubmit();});
 assert('Manual duplicate case ignores capitalization and extra spaces',await ev(n=>qa.data().cases.length===n,duplicateCount));
 await reset();
 for(const role of ['KPPN','KepalaKPPN','Kanwil','PKN']){
  await ev(role=>{qa.user(role);qa.popup();qa.$('#tkd-toast').hidden=true;},role);
  for(const [width,height]of [[1440,900],[1366,768],[1024,768],[768,1024],[390,844],[320,700]]){
   await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
   const layout=await ev(()=>{const shell=document.querySelector('.tkd-shell').getBoundingClientRect(),card=document.querySelector('#tkd-inbox-cases article')?.getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,shellWidth:Math.round(shell.width),firstCardTop:card?Math.round(card.top):null,popupFits:shell.left>=0&&shell.right<=innerWidth+1&&shell.bottom<=innerHeight+1};});
   layouts.push({role,width,height,...layout});assert('Layout '+role+' '+width+'px',!layout.overflow&&layout.popupFits,layout);
   if([1366,390].includes(width)){const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'popup-'+role+'-'+width+'.png'),Buffer.from(shot.data,'base64'));}
  }
  await ev(()=>qa.$('[data-tkd-close]').click());
 }
 await ev(()=>{qa.$('#profile-menu').open=true;qa.$('#tkd-toast').hidden=true;});const menuShot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'pilihan-pengguna.png'),Buffer.from(menuShot.data,'base64'));
 assert('Active user has a non-color selected indication',await ev(()=>document.querySelectorAll('[data-user-role][aria-pressed=true]').length===1));
 await reset();await ev(()=>qa.popup());
 metrics.primaryActionClicks=await ev(()=>{let clicks=0;const listener=()=>clicks++;document.addEventListener('click',listener);qa.$('#tkd-inbox-cases [data-case-action=progress]').click();const f=qa.$('#tkd-action-form');f.elements.note.value='Pembaruan efisiensi';f.elements.deadline.value=qa.target;f.querySelector('[type=submit]').click();document.removeEventListener('click',listener);return clicks;});
 assert('Primary update requires two button clicks',metrics.primaryActionClicks===2,metrics.primaryActionClicks);
 await reset();await ev(()=>{const seed=window.MYINTRESS_TKD_SEED,s=qa.data();const x=s.cases.find(x=>x.stage==='Ditindaklanjuti');for(let i=0;i<300;i++)s.cases.push({...x,id:'PERF-'+i,title:'Pengujian kapasitas '+i});localStorage.setItem(seed.key,JSON.stringify(s));window.dispatchEvent(new StorageEvent('storage',{key:seed.key}));qa.popup();});
 metrics.filter300CasesMs=await ev(()=>{const a=[];for(let i=0;i<5;i++){const t=performance.now();qa.$('#tkd-search').value=i%2?'kapasitas':'tidak cocok';qa.$('#tkd-search').dispatchEvent(new Event('input'));a.push(performance.now()-t);}return a;});
 assert('Filtering 300 added cases remains correct',await ev(()=>document.querySelectorAll('#tkd-inbox-cases article').length===0));
 await reset();await ev(()=>{qa.popup();qa.action('DPS-TKD-2026-011','confirm');window.originalStorageSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===window.MYINTRESS_TKD_SEED.key)throw new DOMException('Full','QuotaExceededError');return window.originalStorageSet.call(this,k,v);};qa.save({note:'Verifikasi saat penyimpanan penuh'});});
 assert('Failed storage does not show a successful save receipt',await ev(()=>qa.$('#tkd-outcome h2').textContent.includes('hanya tersedia pada sesi ini')&&qa.$('#tkd-outcome').textContent.includes('dapat hilang')));
 await ev(()=>Storage.prototype.setItem=window.originalStorageSet);
 await reset();assert('No uncaught application errors',runtimeErrors.length===0,runtimeErrors);
 console.log(JSON.stringify({passed:results.filter(x=>x.pass).length,total:results.length,metrics,artifacts:out},null,2));
})().catch(error=>{console.error(error.stack);process.exitCode=1;}).finally(async()=>{
 const report={time:new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',dateStyle:'full',timeStyle:'short'}).format(new Date()),results,layouts,metrics,runtimeErrors};
 fs.writeFileSync(path.join(out,'hasil-uji.json'),JSON.stringify(report,null,2));
 if(call)try{await Promise.race([call('Browser.close'),delay(1500)]);}catch{}if(ws)try{ws.close();}catch{}if(browser)browser.kill();server.closeAllConnections();server.close();
 // Only the uniquely created test directory is eligible for cleanup.
 if(temp.startsWith(path.join(os.tmpdir(),'myintress-qa-')))try{fs.rmSync(temp,{recursive:true,force:true,maxRetries:5,retryDelay:100});}catch{}
});
