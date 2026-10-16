(function (global) {
"use strict";
function byId(id){return document.getElementById(id);}
function addText(parent,tag,cls,value){var n=document.createElement(tag);if(cls)n.className=cls;n.textContent=String(value==null?"":value);parent.appendChild(n);return n;}
function renderMetric(parent,label,value,note){var c=document.createElement("article");c.className="analysis-metric";addText(c,"span","metric-label",label);addText(c,"strong","metric-value",value);addText(c,"span","metric-note",note);parent.appendChild(c);}
function renderAnalysis(result,state){
var metrics=byId("analysis-metrics"),observed=byId("observed-signals"),hypotheses=byId("ai-hypotheses"),hotspots=byId("hotspot-list");
[metrics,observed,hypotheses,hotspots].forEach(function(n){if(n)n.replaceChildren();});
if(!metrics||!observed||!hypotheses||!hotspots)throw new Error("Analysis result containers are missing.");
var o=result.overview;
renderMetric(metrics,"Grid cells analyzed",o.cellCount,"Synthetic grid");
renderMetric(metrics,"Vegetation-index decline",o.vegetationDeclineCount,"Cells flagged by illustrative rules");
renderMetric(metrics,"Surface-water signals",o.surfaceWaterSignalCount,"Not groundwater or water quality");
renderMetric(metrics,"Data completeness",result.meta.dataCompletenessPercent+"%","Available synthetic index deltas");
result.observedSignals.forEach(function(s){var n=document.createElement("article");n.className="signal-item";addText(n,"strong","",s.label);addText(n,"p","",s.count+" of "+o.cellCount+" cells ("+s.percent+"%)");addText(n,"div","signal-meta","SIMULATED SIGNAL · "+s.metric.toUpperCase());observed.appendChild(n);});
if(!result.aiHypotheses.length)addText(hypotheses,"p","panel-caption","No hypotheses generated for this sample.");
result.aiHypotheses.forEach(function(h){var n=document.createElement("article");n.className="signal-item";addText(n,"span","hypothesis-tag","AI HYPOTHESIS · LOW CONFIDENCE");addText(n,"strong","",h.label);addText(n,"p","",h.rationale);addText(n,"div","signal-meta","Requires independent validation");hypotheses.appendChild(n);});
if(!result.hotspots.length)addText(hotspots,"p","panel-caption","No cells crossed the illustrative review threshold.");
result.hotspots.slice(0,10).forEach(function(h,i){var n=document.createElement("div");n.className="hotspot-item";addText(n,"strong","",(i+1)+". "+h.id);addText(n,"span","","Score "+h.severity.toFixed(3));hotspots.appendChild(n);});
byId("results-title").textContent="Analysis overview · "+state.siteName;byId("results-subtitle").textContent="Period: "+state.period+" · Focus: "+state.focus+" · Seeded synthetic sample";byId("analysis-results").hidden=false;byId("analysis-results").scrollIntoView({behavior:"smooth",block:"start"});
}
function init(){var TT=global.TT;if(!TT||!TT.config||!TT.util)return;if(TT.debug)TT.debug.init();var button=byId("run-analysis");if(button)button.addEventListener("click",function(){var site=TT.util.normalizeLabel(byId("site-name")&&byId("site-name").value,"Untitled study area"),period=byId("analysis-period")?byId("analysis-period").value:"seasonal",focus=byId("analysis-focus")?byId("analysis-focus").value:"all";if(byId("site-name"))byId("site-name").value=site;var state={siteName:site,period:period,focus:focus,dataMode:"synthetic",seed:"terratrace-stage4-"+period+"-"+focus};try{button.disabled=true;button.setAttribute("aria-busy","true");button.textContent="Analyzing sample…";var result=TT.analysis.run({seed:state.seed,size:12});TT.state=state;TT.lastAnalysis=result;renderAnalysis(result,state);TT.ui.toast("Synthetic analysis complete for "+site+".");}catch(e){TT.ui.toast("Analysis could not run. Check diagnostics and try again.");if(global.console&&console.error)console.error("[TerraTrace analysis]",e);}finally{button.disabled=false;button.removeAttribute("aria-busy");button.textContent="Run analysis →";}});if(TT.util.getQueryParam("test")==="1"&&TT.tests)TT.tests.run();document.documentElement.dataset.appReady="true";}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})(window);