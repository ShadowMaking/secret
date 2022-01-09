
/*
dev：dev-deliver-secret.eigen.com
test：test.ieigen.com
prod：rpc.ieigen.com
*/

let protocol = location.protocol;
let WEBSITE_BASEURL;
let LOCATION_HREF;

switch(process.env.NODE_ENV){
	case 'dev':
    WEBSITE_BASEURL =  protocol + '//test.ieigen.com'
    LOCATION_HREF = protocol + '//dev-deliver-secret.eigen.com:8090'
  break;
  case 'test':
		WEBSITE_BASEURL =  protocol + '//test.ieigen.com'
    LOCATION_HREF = protocol + '//test.ieigen.com'
	break;
	case 'production':
		WEBSITE_BASEURL = protocol + '//rpc.ieigen.com'
    LOCATION_HREF + '//secret.ieigen.com'
	break;
}

export { WEBSITE_BASEURL, LOCATION_HREF }

