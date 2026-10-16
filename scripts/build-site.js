const fs=require("node:fs");const path=require("node:path");
const root=__dirname,out=path.join(root,"dist");
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const item of ["index.html","terms.html","privacy.html","css","js","assets","tests",".nojekyll"]){const src=path.join(root,item);if(fs.existsSync(src))fs.cpSync(src,path.join(out,item),{recursive:true});}
const vendor=path.join(out,"vendor");fs.mkdirSync(vendor,{recursive:true});
const leaflet=path.join(root,"node_modules","leaflet","dist");const geotiff=path.join(root,"node_modules","geotiff","dist-browser","geotiff.js");
if(!fs.existsSync(leaflet)||!fs.existsSync(geotiff)){console.error("Missing pinned vendor packages. Run npm install first.");process.exit(1);}
fs.cpSync(leaflet,path.join(vendor,"leaflet"),{recursive:true});fs.copyFileSync(geotiff,path.join(vendor,"geotiff.js"));
console.log("Static site built in dist/ with self-hosted Leaflet 1.9.4 and GeoTIFF 2.1.3.");