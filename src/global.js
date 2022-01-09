
/*
dev：dev-deliver-secret.eigen.com
test：test.ieigen.com
prod：rpc.ieigen.com
*/

let protocol = location.protocol;
let WEBSITE_BASEURL;

switch(process.env.NODE_ENV){
	case 'dev':
  case 'test':
		WEBSITE_BASEURL =  protocol + '//test.ieigen.com'
	break;
	case 'production':
		WEBSITE_BASEURL = protocol + '//rpc.ieigen.com'
	break;
}

export { WEBSITE_BASEURL }

