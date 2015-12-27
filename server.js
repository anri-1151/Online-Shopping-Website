var express=require('express');
var bodyParser=require('body-parser');
var path=require('path');
var router=require('router');
var mongoose=require('mongoose');
var session=require('client-sessions');

var app=express();
app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost/test');
var conn=mongoose.connection;
var Schema=mongoose.Schema;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'html/bshop')));
app.use(session({
	cookieName:'session',
	secret: 'assa_party',
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000
}));
var categsSchema=new Schema({
		category:String
	});


var productSchema=new Schema ({
	_id:Number,
	product_name:String,
	category:String,
	images:[],
	category:String,
	description:String,
	product_price:Number
});

var userSchema=new Schema ({
	name:String,
	surname: String,
	idNumber:String,
	email:String,
	mobile:String,
	username:String,
	password:String,
	orders:[]
});

app.get('/',function(req,res) {
	if (req.session && req.session.user) {
		res.render(path.join(__dirname+'/public/index.ejs'),{'userName':req.session.user.username,'session':req.session});
    } else {
		res.render(path.join(__dirname+'/public/index.ejs'),{'userName':'','session':''});
	}
});

app.get('/main',function(req,res) {
	var categsResult='asa';
	var categModel=mongoose.model('categories',categsSchema);
	var categs=categModel.find({},function(err,result) {
		if (err) {
			console.log(err);
		} else {
			categsResult=result;
			
			var productModel=mongoose.model('products',productSchema);
	        var prods=productModel.find({'product_available':{$gt:0}},function(err,result) {
				if (err) {
					console.log(err);
				} else {
					var total=result.length;
					var pageSize=2;
					var pageCount=Math.ceil(total/pageSize);
					var currentPage=1;
					var productArray=[],productList=[];
					//split list into groups
					while (result.length>0) {
						productArray.push(result.splice(0,pageSize));
					}
					//set current page if specifed as get variable (eg: /?page=2)
					if (typeof req.query.page!=='undefined') {
						currentPage=Number(req.query.page);
					}
					productList=productArray[Number(currentPage)-1];
			
					res.render(path.join(__dirname+'/public/main.ejs'),
							{'categs':categsResult,
							'productebi':productList,
							'pageSize':pageSize,
							'totalProducts':total,
							'pageCount':pageCount,
							'currentPage':currentPage
					});
				}
			});
	
		}
    });
	
});

app.get('/register',function(req,res) {
	res.render(path.join(__dirname+'/public/register.ejs'),{'session':''});
});
var category;
app.get('/category',function(req,res) {
	category=req.query.cat;
	if (req.session && req.session.user) {
		res.render(path.join(__dirname+'/public/category.ejs'),{'userName':req.session.user.username,'session':req.session});
	} else {
		res.render(path.join(__dirname+'/public/category.ejs'),{'userName':'','session':''});
	}
});
app.get('/main-category',function(req,res) {
	//var category=req.query.cat;
	var categsResult;
	var categModel=mongoose.model('categories',categsSchema);
	var categs=categModel.find({},function(err,result) {
		if (err) {
			console.log(err);
		} else {
			categsResult=result;
			var productModel=mongoose.model('products',productSchema);
			var prods=productModel.find({'category':category,'product_available':{$gt:0}},function(err,result) {
				if (err) {
					console.log(err);
				} else {
					var total=result.length;
					var pageSize=1;
					var pageCount=Math.ceil(total/pageSize);
					var currentPage=1;
					var productArray=[],productList=[];
					//split list into groups
					while (result.length>0) {
						productArray.push(result.splice(0,pageSize));
					}
					//set current page if specifed as get variable (eg: /?page=2)
					if (typeof req.query.page!=='undefined') {
						currentPage=Number(req.query.page);
					}
					productList=productArray[Number(currentPage)-1];
					res.render(path.join(__dirname+'/public/main-categs.ejs'),
							{'categs':categsResult,
							'productebi':productList,
							'pageSize':pageSize,
							'totalProducts':total,
							'pageCount':pageCount,
							'currentPage':currentPage,
							'category':category
							});
				}
			});
		}
    });
});

app.get('/product-details',function(req,res) {
	var userName='';
	if (req.session && req.session.user) {
		userName=req.session.user.username;
	} 
	var productId=req.query.product;
	var categsResult;
	var categModel=mongoose.model('categories',categsSchema);
	var categs=categModel.find({},function(err,result) {
		if (err) {
			console.log(err);
		} else {
			categsResult=result;
			var productModel=mongoose.model('products',productSchema);
			var prods=productModel.find({'_id':productId,'product_available':{$gt:0}},function(err,result) {
				if (err) {
					console.log(err);
				} else {
	                res.render(path.join(__dirname+'/public/product-details.ejs'),{'categs':categsResult,'producti':result,'userName':userName,'session':req.session});	
				}
			});
		}
    });
});

app.get('/LogIn',function(req,res) {
	res.render(path.join(__dirname+'/public/login.ejs'));
});

app.post('/make-registration',function(req,res) {
	var name=req.body.name;
	var surname=req.body.surname;
	var idNumber=req.body.idNumber;
	var email=req.body.email;
	var mobile=req.body.mobile;
	var username=req.body.username;
	var password=req.body.password;
	var newUser={
		'name':name,
		'surname':surname,
		'idNumber':idNumber,
		'email':email,
		'mobile':mobile,
		'username':username,
		'password':password,
		'orders':[]
	};
	conn.collection('users').insert(newUser);
	res.send(name+' '+surname+' '+idNumber+' '+email+' '+mobile+' '+username+' '+password);
	
});
app.post('/user-login',function(req,res) {
	var userName=req.body.userName;
	var password=req.body.password;
	var userModel=mongoose.model('users',userSchema);
	var user=userModel.findOne({'username':userName,'password':password},function(err,result) {
		if (err) {
			console.log(err);
		} else {
			if (result) {
				req.session.user=result;
				req.session.cart={'products':[]};
				res.render(path.join(__dirname+'/public/index.ejs'),{'userName':userName,'session':req.session});
			} else {
				res.send('Not Valid User');
			}		
		}
	});
});
app.get('/LogOut',function(req,res) {
	req.session.reset();
	res.redirect('/');
});
app.get('/addCard',function(req,res) {
	if (req.session && req.session.cart) {
		var prod=req.query.product;
		var productModel=mongoose.model('products',productSchema);
		var prods=productModel.findOne({'_id':prod},function(err,result) {
			var l=req.session.cart.products.length;
			if (l==0) {
				req.session.cart.products.push({'id':result._id,'name':result.product_name,'price':result.product_price,'quantity':1,'image':result.images[0]});
			} else {
				var exist=false;
				for (var i=0; i<l; i++) {
					if (req.session.cart.products[i].id==prod){
						req.session.cart.products[i].quantity++;
						exist=true;
						break;
					} else {
						exist=false;
					}
				}
				if (!exist) {
					req.session.cart.products.push({'id':result._id,'name':result.product_name,'price':result.product_price,'quantity':1,'image':result.images[0]});
				}
			}
			var url='/product-details?product='+prod;
			res.redirect(url);
		});
	} else {
		var prod=req.query.product;
		var url='/product-details?product='+prod;
		res.redirect(url);
	}
});

app.get('/view-cart', function(req,res) {
	if (req.session && req.session.cart) {
		res.render(path.join(__dirname+'/public/view-cart.ejs'),{'userName':req.session.user.username,'session':req.session});
	} else {
		res.redirect('/');
	}
});

app.get('/my-account',function(req,res) {
    if (req.session && req.session.cart) {
		res.render(path.join(__dirname+'/public/myaccount.ejs'),{'userName':req.session.user.username,'session':req.session});
	} else {
		res.redirect('/');
	}
})

app.post('/remove', function(req,res) {
	var str=req.body.remove;
	str.split(".");
	var id=Number(str[0]);
	for (var i=0, l=req.session.cart.products.length; i<l; i++) {
		if (req.session.cart.products[i].id==id) {
			req.session.cart.products.splice(i,1);
			break;
		}
	}
	res.redirect('/view-cart');
});

app.post('/update',function(req, res) {
	var quantity=req.body.quantity;
	for (var i=0, l=req.session.cart.products.length; i<l; i++) {
		req.session.cart.products[i].quantity=quantity[i];
	}
	var i=0;
	while (i<req.session.cart.products.length) {
		if (req.session.cart.products[i].quantity<=0) {
			req.session.cart.products.splice(i,1);
		} else {
			i++;
		}
	}
	res.redirect('/view-cart');
});

app.post('/checkout',function(req,res) {
	if (req.session && req.session.cart) {
		res.render(path.join(__dirname+'/public/checkout.ejs'),{'userName':req.session.user.username,'session':req.session});
	} else {
		res.redirect('/');
	}
});

app.post('/pay',function(req,res) {
	if (req.session && req.session.cart) {
		var cardName=req.body.cardName;
		var cardNumber=req.body.cardNumber;
		var cardCvc=req.body.cvc;
		var expMonth=req.body.expMonth;
		var expYear=req.body.expYear;
		var products=[];
		var total=0;
		for (var i=0, l=req.session.cart.products.length; i<l; i++) {
		    products.push({'name':req.session.cart.products[i].name,
			               'quantity':req.session.cart.products[i].quantity,
						   'price':req.session.cart.products[i].price
			});
			total+=req.session.cart.products[i].quantity*req.session.cart.products[i].price;
	    }   
		var insertUser={'order_date':new Date(),
					'card_name':cardName,
					'card_number':cardNumber,
					'card_cvc':cardCvc,
					'expire_date':expMonth+'/'+expYear,
					'total':total,
					'status':'not delivery',
					'products':products
		};
		//lets require/import the mongodb native drivers.
        var mongodb = require('mongodb');

		//We need to work with "MongoClient" interface in order to connect to a mongodb server.
		var MongoClient = mongodb.MongoClient;

		// Connection URL. This is where your mongodb server is running.
		var url = 'mongodb://localhost:27017/test';

		// Use connect method to connect to the Server
		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else {
				//HURRAY!! We are connected. :)
				console.log('Connection established to', url);
  

				// Get the documents collection
				var collection = db.collection('products');
				var users=db.collection('users');
				for (var i=0, l=req.session.cart.products.length; i<l; i++) {
				    var prods=collection.findAndModify(
					    {'_id': req.session.cart.products[i].id},
					    [['_id', 1]],
					    {
						    $inc: {'product_available': -1},
							$push: {'product_bought_by':{'user_id':req.session.user._id}}
							
					    }
					   ,function(err,result) {
					   		if (err) {
					   			console.log(err);
					   		}
						    console.log(result);
					    });
							
						
				}
				users.updateOne(
					{ 'username' : req.session.user.username},
					{
						$push:{'orders':insertUser}
					},
					function(err,result) {
						if (err) {
							console.log(err);
						}
						console.log(result);
					}
				);
				res.send('Success');
			};
		});
	}
});

app.get('/personal-info', function(req,res) {
	if (req.session) {
		res.render(path.join(__dirname+'/public/personal-info.ejs'),{'user':req.session.user,'session':req.session,'userName':req.session.user.username});
	} else {
		res.redirect('/');
	}
});

app.post('/update-info', function(req,res) {
	if (req.session) {
		var mongodb = require('mongodb');

		//We need to work with "MongoClient" interface in order to connect to a mongodb server.
		var MongoClient = mongodb.MongoClient;

		// Connection URL. This is where your mongodb server is running.
		var url = 'mongodb://localhost:27017/test';

		// Use connect method to connect to the Server
		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else {
				var name=req.body.name;
				var surname=req.body.surname;
				var idNumber=req.body.idNumber;
				var email=req.body.email;
				var mobile=req.body.mobile;
				var users=db.collection('users');
				users.updateOne(
					         {'username':req.session.user.username}, 
					         { 
					         	$set:{'name': name,'surname':surname,'idNumber':idNumber,'email':email,'mobile':mobile}
					         },
					         function(err,result) {
								if (err) {
									console.log(err);
								} else {
									console.log(result);
									users.findOne({'username':req.session.user.username}, function(err, response) {
                                        req.session.user=response;
                                        res.redirect('/personal-info')
									});
									
								}
							}
				);
			}
		});
	    
	} else {
		redirect('/');
	}
});

app.get('/ordered-products', function(req, res) {
	if (req.session && req.session.cart) {
		var orderedModel=mongoose.model('users',userSchema);
		var orderedProcts=orderedModel.findOne({'username':req.session.user.username}, function(err, response) {
			if (err) {
					console.log(err);
				} else {
					var total=response.orders.length;
					var pageSize=1;
					var pageCount=Math.ceil(total/pageSize);
					var currentPage=1;
					var productArray=[],productList=[];
					//split list into groups

					while (response.orders.length>0) {
						productArray.push(response.orders.splice(0,pageSize));
					}
					//set current page if specifed as get variable (eg: /?page=2)
					if (typeof req.query.page!=='undefined') {
						currentPage=Number(req.query.page);
					}
					productList=productArray[Number(currentPage)-1];
			
					res.render(path.join(__dirname+'/public/myProducts.ejs'),
							{
							'productebi':productList,
							'pageSize':pageSize,
							'totalProducts':total,
							'pageCount':pageCount,
							'currentPage':currentPage,
							'userName':req.session.user.username,
							'session':req.session
					});
				}

		});
	} else {
		res.redirect('/');
	}
});

app.get('/change-password', function(req,res) {
	if (req.session) {
		res.render(path.join(__dirname+'/public/changePassword.ejs'),{'user':req.session.user,'session':req.session,'userName':req.session.user.username,
	        'error':null});
	} else {
		res.redirect('/');
	}
});

app.post('/changePassword', function(req,res) {
	if (req.session) {
		var passw1=req.body.passw1;
		var passw2=req.body.passw2;
		var passw=req.body.passw;
		var userModel=mongoose.model('users',userSchema);
		var user=userModel.findOne({'username':req.session.user.username,'password':passw}, function(err,response) {
			if (err) {
				console.log(err);
			} else {
				console.log(passw1, passw2);
				if (response) {
					if (passw1==passw2) {

						var mongodb = require('mongodb');


						var MongoClient = mongodb.MongoClient;


						var url = 'mongodb://localhost:27017/test';

						MongoClient.connect(url, function (err, db) {
						if (err) {
							console.log('Unable to connect to the mongoDB server. Error:', err);
						} else {
							var users=db.collection('users');
							users.updateOne(
						         {'username':req.session.user.username}, 
						         { 
						         	$set:{'password': passw1}
						         },
						         function(err,result) {
									if (err) {
										console.log(err);
									} else {
										console.log(result);
										users.findOne({'username':req.session.user.username}, function(err, response) {
	                                        req.session.user=response;
	                                        res.redirect('/change-password');
										});
										
									}
								});
						    }
	                    });

					} else {
						res.render(path.join(__dirname+'/public/changePassword.ejs'),{'user':req.session.user,'session':req.session,'userName':req.session.user.username,
							'error':'password doesnot match'});
					}
				} else {
					res.render(path.join(__dirname+'/public/changePassword.ejs'),{'user':req.session.user,'session':req.session,'userName':req.session.user.username,
							'error':'not valid user'});
				}
			}
		});
		

	} else {
		res.redirect('/');
	}
});

app.listen(3030);
console.log('server is running');