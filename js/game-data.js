'use strict';
// 게임 데이터: 사건 목록과 사무실 장비 목록
// 실제 게임 로직과 분리해 두어 사건/장비 추가 시 이 파일만 먼저 보면 됩니다.

const missionTemplates = [
 {id:'lighthouse',type:'등대 수리',title:'거문도등대 등명기 복구',status:'등명기 소등',brief:'거문도등대의 등명기가 작동하지 않습니다. 현장에서 전원·배선·등명기를 점검하고 복구하세요.',required:['공구함','예비배터리','케이블','안전모','작업등','예비등명기'],maxLoad:58,goal:{x:13400,y:1600,name:'거문도등대',kind:'lighthouse'}},
 {id:'beacon_repair',type:'등표 수리',title:'해상 등표 점등 복구',status:'등표 소등',brief:'항로 옆 등표의 불빛이 꺼졌습니다. 배터리와 등명기 부품을 점검해 다시 점등하세요.',required:['공구함','예비배터리','케이블','절연장갑','작업등','등명기 렌즈'],maxLoad:48,goal:{x:11100,y:3050,name:'제3호 등표',kind:'beacon'}},
 {id:'beacon_install',type:'등표 설치',title:'암초 위험구역 신규 등표 설치',status:'신규 설치',brief:'항로 중앙 부근에서 새 암초가 확인되었습니다. 설치 장비를 챙겨 위험구역 인근에 새 등표를 설치하세요.',required:['공구함','안전모','설치 브래킷','예비등명기','태양광 패널','배터리팩','고정 볼트'],maxLoad:72,goal:{x:9250,y:4470,name:'신규 등표 설치지점',kind:'install'}},
 {id:'flash_pattern',type:'점멸 이상',title:'등명기 점멸 패턴 이상 점검',status:'점멸 불규칙',brief:'항로표지의 불빛이 평소와 다른 간격으로 깜빡이고 있습니다. 제어장치와 전원 상태를 확인해 정상 점멸로 복구하세요.',required:['공구함','멀티미터','점멸제어기','안전모','작업등','표지 도면'],maxLoad:36,goal:{x:11900,y:2850,name:'제5호 등표',kind:'beacon'}},
 {id:'solar_fault',type:'전원 점검',title:'태양광 충전 장치 이상',status:'충전량 저하',brief:'등표의 배터리 충전량이 계속 떨어지고 있습니다. 태양광 전원 계통과 배터리 상태를 점검하세요.',required:['공구함','멀티미터','태양광 패널','배터리팩','절연장갑','작업등'],maxLoad:44,goal:{x:10450,y:3900,name:'태양광 등표',kind:'beacon'}},
 {id:'lens_clean',type:'광학부 점검',title:'등명기 렌즈 오염 점검',status:'불빛 약화',brief:'등명기는 켜져 있지만 불빛이 평소보다 약하게 보입니다. 렌즈와 광학부 상태를 확인하고 깨끗하게 정비하세요.',required:['공구함','안전모','작업등','세척도구','구명조끼','등명기 렌즈'],maxLoad:32,goal:{x:12600,y:2500,name:'렌즈 점검 등표',kind:'beacon'}},
 {id:'position_drift',type:'위치 복구',title:'등표 위치 이탈 복구',status:'위치 이탈',brief:'등표가 원래 표시된 위치에서 벗어난 것이 확인되었습니다. 위치를 확인하고 고정 상태를 점검해 제자리로 복구하세요.',required:['공구함','구명조끼','로프','GPS 측위기','표지 도면','계류체인'],maxLoad:42,goal:{x:8850,y:5150,name:'위치 이탈 등표',kind:'beacon'}}
];

const items = [
 {name:'점멸제어기',icon:'🎛️',x:790,y:390,kg:3,zone:'출동 준비구역'},
 {name:'세척도구',icon:'🧽',x:995,y:390,kg:2,zone:'출동 준비구역'},
 {name:'GPS 측위기',icon:'📡',x:790,y:535,kg:3,zone:'출동 준비구역'},
 {name:'계류체인',icon:'⛓️',x:995,y:535,kg:9,zone:'출동 준비구역'},
 {name:'공구함',icon:'🧰',x:1210,y:275,kg:7,zone:'A · 공구'},
 {name:'멀티미터',icon:'📟',x:1405,y:275,kg:2,zone:'A · 공구'},
 {name:'케이블',icon:'🔌',x:1210,y:485,kg:5,zone:'A · 전기'},
 {name:'고정 볼트',icon:'🔩',x:1405,y:485,kg:4,zone:'A · 설치부품'},
 {name:'예비배터리',icon:'🔋',x:1565,y:275,kg:9,zone:'B · 배터리'},
 {name:'배터리팩',icon:'🔋',x:1770,y:275,kg:11,zone:'B · 배터리'},
 {name:'작업등',icon:'🔦',x:1565,y:485,kg:4,zone:'B · 조명'},
 {name:'태양광 패널',icon:'☀️',x:1770,y:485,kg:8,zone:'B · 전원'},
 {name:'예비등명기',icon:'💡',x:1210,y:690,kg:12,zone:'C · 등명기'},
 {name:'등명기 렌즈',icon:'🔆',x:1405,y:690,kg:3,zone:'C · 광학부품'},
 {name:'설치 브래킷',icon:'🧱',x:1210,y:885,kg:10,zone:'C · 설치부품'},
 {name:'방수 접속함',icon:'🧰',x:1405,y:885,kg:4,zone:'C · 전기'},
 {name:'안전모',icon:'⛑️',x:790,y:710,kg:2,zone:'출동 준비구역'},
 {name:'절연장갑',icon:'🧤',x:995,y:710,kg:1,zone:'출동 준비구역'},
 {name:'구명조끼',icon:'🦺',x:892,y:865,kg:2,zone:'출동 준비구역'},
 {name:'로프',icon:'🪢',x:1545,y:690,kg:5,zone:'D · 계류/설치'},
 {name:'표지 도면',icon:'📋',x:1690,y:690,kg:1,zone:'D · 문서'},
 {name:'축구공',icon:'⚽',x:410,y:845,kg:1,zone:'휴게공간'},
 {name:'낚싯대',icon:'🎣',x:1545,y:865,kg:4,zone:'D · 기타'},
 {name:'여행가방',icon:'🧳',x:1690,y:865,kg:8,zone:'D · 기타'}
].map(v => ({ ...v, taken: false }));
