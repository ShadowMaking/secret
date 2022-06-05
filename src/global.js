
/*
dev：dev-deliver-secret.eigen.com
test：test.eigen.cash
prod：rpc.eigen.cash
*/

let protocol = location.protocol;
let WEBSITE_BASEURL;
let LOCATION_HREF;

switch(process.env.NODE_ENV){
	case 'dev':
    WEBSITE_BASEURL = 'https://preview.eigen.cash'
    LOCATION_HREF = protocol + '//dev-deliver-secret.eigen.com:8090'
  break;
  case 'preview':
    WEBSITE_BASEURL =  protocol + '//preview.eigen.cash'
    LOCATION_HREF = protocol + '//preview.eigen.cash'
  break;
  case 'test':
		WEBSITE_BASEURL =  protocol + '//test.eigen.cash'
    LOCATION_HREF = protocol + '//test.eigen.cash'
	break;
	case 'production':
		WEBSITE_BASEURL = protocol + '//rpc.eigen.cash'
    LOCATION_HREF = protocol + '//secret.eigen.cash'
	break;
}

export { WEBSITE_BASEURL, LOCATION_HREF }

