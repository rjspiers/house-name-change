const chai = require('chai');
const chaiHttp = require('chai-http');
//const server = require('../server'); // use if module.exports set to export app
const should = chai.should();
const expect = chai.expect

chai.use(chaiHttp);

/* routes */
const appRoot = 'http://localhost/node/house-name-check'
// test with https route (requires cert & different host names in development and production)
/* const appRoot = 'https://server.guildford.gov.uk/node/house-name-check' */


describe('Frontend', function() {
	it('Frontend should have a http 200', function(done) {
		chai.request(appRoot)
		.get('/')
		.end(function(err, res){
			res.should.have.status(200);
			res.should.be.html;
			done();
		});
	}); // it
}) // describe

describe('API Routes', function() {
	it('/api/ should work', function(done) {
		chai.request(appRoot)
		.get('/api/')
		.end(function(err, res){
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('api_message');
			done();
		});
	}); // it
	it('/testDbConn/ should work', function(done) {
		chai.request(appRoot)
		.get('/api/testDbConn/')
		.end(function(err, res){
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('status');
			res.body.status.should.equal('success');
			done();
		});
	}); // it
	it('/postcodeStatic/ could work')
	it('/postcodeUk/ could work')
	describe('/postcode/', function() {
		it('/postcode/ should give http 422', function(done) {
			chai.request(appRoot)
			.get('/api/postcodeUk/')
			.end(function(err, res){
				res.should.have.status(422);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.have.property('error');
				res.body.error.should.equal('postcode is invalid');
				done();
			});
		}); // it
		it('"?postcode=" should give http 422', function(done) {
			chai.request(appRoot)
			.get('/api/postcode?postcode=')
			.end(function(err, res){
				res.should.have.status(422);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.have.property('error');
				res.body.error.should.equal('a query parameter (postcode, uprn, usrn) is needed');
				done();
			});
		}); // it
		it('"?postcode=GU24BB" should give http 200', function(done) {
			chai.request(appRoot)
			.get('/api/postcode?postcode=GU24BB')
			.end(function(err, res){
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('array');
				res.body.should.have.property('0');
				res.body[0].should.be.a('object');
				done();
			});
		}); // it
		it('"?postcode=RG20EH" should give http 422', function(done) {
			chai.request(appRoot)
			.get('/api/postcode?postcode=RG20EH')
			.end(function(err, res){
				res.should.have.status(422);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.have.property('error');
				res.body.error.should.equal('no Guildford Borough addresses in this postcode');
				done();
			});
		}); // it
	}); // describe
	describe('/nameCheck? supplied parameter validation tests', function() {
		it('/nameCheck? could give error if no params were supplied')
		it('could give error if &uprn!=int')
		it('should give error if uprn is not found in llpg', function(done) {
			chai.request(appRoot)
			.get('/api/nameCheck?newHouseName=Millmead House&uprn=10006233101')
			.end(function(err, res){
				res.should.have.status(422);
				res.should.be.json;
				res.body.should.have.property('error');
				done()
			})
		})
		it('should give error if &newHouseName longer than 255 chars', function(done) {
			chai.request(appRoot)
			.get('/api/nameCheck?newHouseName=this should be two hundred and fifty six characters this should be two hundred and fifty six characters this should be two hundred and fifty six characters this should be two hundred and fifty six characters this should be two hundred and fifty six charact&uprn=100062331014')
			.end(function(err, res){
				res.should.have.status(422);
				res.should.be.json;
				res.body.should.have.property('error');
				done()
			})
		})
		it('should not give error if &newHouseName under than 255 chars', function(done) {
			chai.request(appRoot)
			.get('/api/nameCheck?newHouseName=this should be two hundred and fifty five characters this should be two hundred and fifty five characters this should be two hundred and fifty five characters this should be two hundred and fifty five characters this should be two hundred and fifty five c&uprn=100062331014')
			.end(function(err, res){
				res.should.have.status(200);
				res.should.be.json;
				done()
			})
		})
	})
	describe('/nameCheck? response tests', function() {
		it('"Millmead House" should fail the nameCheck rules', function(done) {
			chai.request(appRoot)
			.get('/api/nameCheck?newHouseName=Millmead House&uprn=100062331014')
			.end(function(err, res){
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.have.property('nameChecks');
				res.body.nameChecks.should.be.a('object');
				res.body.status.should.equal('success');
				res.body.nameChecks.summary.pass.should.be.a('boolean');
				res.body.nameChecks.summary.pass.should.equal(false);
				res.body.nameChecks.rule.profanityDetected.should.be.a('boolean');
				res.body.nameChecks.rule.profanityDetected.should.equal(false);
				res.body.nameChecks.rule.identicalNameInUSRN.pass.should.be.a('boolean');
				res.body.nameChecks.rule.identicalNameInUSRN.pass.should.equal(false);
				res.body.nameChecks.rule.identicalNameInUSRN.data.should.be.a('array');
				res.body.nameChecks.rule.identicalNameInUSRN.data.should.have.lengthOf.above(0);
				res.body.nameChecks.rule.identicalNameInPostcodeSector.pass.should.be.a('boolean');
				res.body.nameChecks.rule.identicalNameInPostcodeSector.pass.should.equal(false);
				res.body.nameChecks.rule.identicalNameInPostcodeSector.data.should.be.a('array');
				res.body.nameChecks.rule.identicalNameInPostcodeSector.data.should.have.lengthOf.above(0);
				res.body.nameChecks.rule.identicalSoundingNameInUSRN.pass.should.be.a('boolean');
				res.body.nameChecks.rule.identicalSoundingNameInUSRN.pass.should.equal(false);
				res.body.nameChecks.rule.identicalSoundingNameInUSRN.data.should.be.a('array');
				res.body.nameChecks.rule.identicalSoundingNameInUSRN.data.should.have.lengthOf.above(0);
				res.body.nameChecks.rule.identicalSoundingNameInPostcodeSector.pass.should.be.a('boolean');
				res.body.nameChecks.rule.identicalSoundingNameInPostcodeSector.pass.should.equal(false);
				res.body.nameChecks.rule.identicalSoundingNameInPostcodeSector.data.should.be.a('array');
				res.body.nameChecks.rule.identicalSoundingNameInPostcodeSector.data.should.have.lengthOf.above(0);
				res.body.nameChecks.rule.suffix.isLastWordReservedSuffix.should.be.a('boolean');
				res.body.nameChecks.rule.suffix.isLastWordReservedSuffix.should.equal(true);
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.pass.should.be.a('boolean');
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.pass.should.equal(false);
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.data.should.be.a('array');
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.data.should.have.lengthOf.above(0);
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.pass.should.be.a('boolean');
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.pass.should.equal(false);
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.data.should.be.a('array');
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.data.should.have.lengthOf.above(0);
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.pass.should.be.a('boolean');
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.pass.should.equal(false);
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.data.should.be.a('array');
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.data.should.have.lengthOf.above(0);
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.pass.should.be.a('boolean');
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.pass.should.equal(false);
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.data.should.be.a('array');
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.data.should.have.lengthOf.above(0);
				done();
			});
		}); // it
		it('"My Great Name" should pass the nameCheck rules', function(done) {
			chai.request(appRoot)
			.get('/api/nameCheck?newHouseName=My Great Name&uprn=100062331014')
			.end(function(err, res){
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.have.property('nameChecks');
				res.body.nameChecks.should.be.a('object');
				res.body.status.should.equal('success');
				res.body.nameChecks.summary.pass.should.be.a('boolean');
				res.body.nameChecks.summary.pass.should.equal(true);
				res.body.nameChecks.rule.profanityDetected.should.be.a('boolean');
				res.body.nameChecks.rule.profanityDetected.should.equal(false);
				res.body.nameChecks.rule.identicalNameInUSRN.pass.should.be.a('boolean');
				res.body.nameChecks.rule.identicalNameInUSRN.pass.should.equal(true);
				res.body.nameChecks.rule.identicalNameInUSRN.data.should.be.a('array');
				res.body.nameChecks.rule.identicalNameInUSRN.data.should.have.lengthOf(0);
				res.body.nameChecks.rule.identicalNameInPostcodeSector.pass.should.be.a('boolean');
				res.body.nameChecks.rule.identicalNameInPostcodeSector.pass.should.equal(true);
				res.body.nameChecks.rule.identicalNameInPostcodeSector.data.should.be.a('array');
				res.body.nameChecks.rule.identicalNameInPostcodeSector.data.should.have.lengthOf(0);
				res.body.nameChecks.rule.identicalSoundingNameInUSRN.pass.should.be.a('boolean');
				res.body.nameChecks.rule.identicalSoundingNameInUSRN.pass.should.equal(true);
				res.body.nameChecks.rule.identicalSoundingNameInUSRN.data.should.be.a('array');
				res.body.nameChecks.rule.identicalSoundingNameInUSRN.data.should.have.lengthOf(0);
				res.body.nameChecks.rule.identicalSoundingNameInPostcodeSector.pass.should.be.a('boolean');
				res.body.nameChecks.rule.identicalSoundingNameInPostcodeSector.pass.should.equal(true);
				res.body.nameChecks.rule.identicalSoundingNameInPostcodeSector.data.should.be.a('array');
				res.body.nameChecks.rule.identicalSoundingNameInPostcodeSector.data.should.have.lengthOf(0);
				res.body.nameChecks.rule.suffix.isLastWordReservedSuffix.should.be.a('boolean');
				res.body.nameChecks.rule.suffix.isLastWordReservedSuffix.should.equal(false);
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.pass.should.be.a('boolean');
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.pass.should.equal(true);
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.data.should.be.a('array');
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.data.should.have.lengthOf(0);
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.pass.should.be.a('boolean');
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.pass.should.equal(true);
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.data.should.be.a('array');
				res.body.nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.data.should.have.lengthOf(0);
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.pass.should.be.a('boolean');
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.pass.should.equal(true);
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.data.should.be.a('array');
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.data.should.have.lengthOf(0);
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.pass.should.be.a('boolean');
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.pass.should.equal(true);
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.data.should.be.a('array');
				res.body.nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.data.should.have.lengthOf(0);
				done();
			});
		}); // it
		it('"Millmead\'s House" should fail isAlphaOrSpace', function(done) {
			chai.request(appRoot)
			.get('/api/nameCheck?newHouseName=Millmead\'s House&uprn=100062331014')
			.end(function(err, res){
				res.body.nameChecks.rule.isAlphaOrSpace.should.be.a('boolean');
				res.body.nameChecks.rule.isAlphaOrSpace.should.equal(false);
				done();
			});
		}); // it
		it('"Millmead-House" should fail isAlphaOrSpace', function(done) {
			chai.request(appRoot)
			.get('/api/nameCheck?newHouseName=Millmead-House&uprn=100062331014')
			.end(function(err, res){
				res.body.nameChecks.rule.isAlphaOrSpace.should.be.a('boolean');
				res.body.nameChecks.rule.isAlphaOrSpace.should.equal(false);
				done();
			});
		}); // it
		it('Profanity should be detected', function(done) {
			chai.request(appRoot)
			.get('/api/nameCheck?newHouseName=My Great badword Name&uprn=100062331014')
			.end(function(err, res){
				res.body.nameChecks.rule.profanityDetected.should.be.a('boolean');
				res.body.nameChecks.rule.profanityDetected.should.equal(true);
				done();
			});
		}); // it
		it('Profanity should not be detected', function(done) {
			chai.request(appRoot)
			.get('/api/nameCheck?newHouseName=My Great Name&uprn=100062331014')
			.end(function(err, res){
				res.body.nameChecks.rule.profanityDetected.should.be.a('boolean');
				res.body.nameChecks.rule.profanityDetected.should.equal(false);
				done();
			});
		}); // it
		it('Last word should be reserved suffix', function(done) {
			chai.request(appRoot)
			.get('/api/nameCheck?newHouseName=My Great House&uprn=100062331014')
			.end(function(err, res){
				res.body.nameChecks.rule.suffix.isLastWordReservedSuffix.should.be.a('boolean');
				res.body.nameChecks.rule.suffix.isLastWordReservedSuffix.should.equal(true);
				done();
			});
		}); // it
		it('Last word should not be reserved suffix', function(done) {
			chai.request(appRoot)
			.get('/api/nameCheck?newHouseName=My Great Name&uprn=100062331014')
			.end(function(err, res){
				res.body.nameChecks.rule.suffix.isLastWordReservedSuffix.should.be.a('boolean');
				res.body.nameChecks.rule.suffix.isLastWordReservedSuffix.should.equal(false);
				done();
			});
		}); // it
	}); // describe
}); // describe
