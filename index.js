"use strict"
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const port = 8000;
// const { createPool } = require('mysql');
const cookieParser = require('cookie-parser');
const  session  = require('express-session');
// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;

var currentUserId = -1;

// const pool = createPool({
//     host: "localhost",
//     user: "root",
//     password: 'kkkk',
//     database: "E_TRADING_DATABASE",
//     connectionLimit: 100,
//     port: 3306
// });

const app = express();
const flash = require('connect-flash');
const customMware = require('./config/middleware');
const res = require('express/lib/response');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded());

app.use(express.static(__dirname + '/public'));

app.use(cookieParser());
app.use(fileUpload());

app.use(session({
    name: 'biscuit',
    secret: 'blahsomething',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    }
}));

// app.use(passport.initialize());
// app.use(passport.session());

// app.use(flash());
// app.use(customMware.setFlash);

app.get('/',function(req,res){
    if(req.isAuthenticated()){
        return res.redirect('/home-page');
    }
    return res.render('signUp');
});


// // authentication using passport
// // passport.use(new LocalStrategy({
// //     usernameField: 'email',
// //     passReqToCallback:true
// // },
// function(req,email, password, done){
    
//     pool.query(`select email,count(id) as numOfRows,id,pswd from users where email = "${email}" `, function(err, result) {
//     if (err) {
//         req.flash('error',err);
//        return done(err);
//     }
//     var num = result[0].numOfRows;
//     if(num == 0){
//         req.flash('error','Invalid Username/Password');
//         return done(null, false);
//     }

//     if(password == result[0].pswd){
//        return done(null, result);
        
//     }else{
//         req.flash('error','Invalid Username/Password');
//         return done(null, false);
//     }
// });
// }
// ));

// // serializing the user to decide which key is to be kept in the cookies
// passport.serializeUser(function(user, done){
//     currentUserId = user[0].id;
//     done(null, user[0].id);
// });

// // deserializing the user from the key in the cookies
// passport.deserializeUser(function(id, done){
//     pool.query(` select * from users where id = ${id}`, function(err, result) {
//         if (err || result[0].id == null) {
//             // console.log('Error in finding user --> Passport');
//             return done(err);
//         }
//          return done(null, result);
//     });
// });

// var http = require("http").createServer(app);
// var socketIO = require("socket.io")(http, {
//     cors: {
//         origin: "*"
//     }
// });
 
// function giveDate(a) {
//     var d = new Date(a);
//     let cDate = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
//     let cTime = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
//     let dateTime = cDate + ' ' + cTime;
//     return dateTime;
//   }

// var users = [];
 
// socketIO.on("connection", function (socket) {
 
//     socket.on("connected", function (userId) {
//         users[userId] = socket.id;
//     });
 
//     socket.on("sendEvent", async function (data) {
        
//         pool.query("SELECT * FROM users WHERE id = " + data.currentUserId, function (error, sender) {
//             var refer_name;
            
//             if(data.table_name == "home") refer_name = `adTitle`;
//             else refer_name = `name`;
//             pool.query(`select ${refer_name} as name from ${data.table_name} where owner_id = ${data.owner_id} and entryTime = '${data.entryTime}'` , function (err, result) {

//                 pool.query(`INSERT requests(customer_id,owner_id,productName,entryTime,purchaseTime,status) 
//                 SELECT ${data.currentUserId},${data.owner_id},'${result[0].name}','${data.entryTime}',${null},'pending' WHERE NOT EXISTS 
//                     (   SELECT  1
//                         FROM    requests
//                         WHERE   customer_id = ${data.currentUserId}
//                         AND     owner_id = ${data.owner_id} 
//                         AND     productName = '${result[0].name}'
//                         AND 	entryTime = '${data.entryTime}'
//                         AND		purchaseTime is ${null}
//                         AND		status = 'pending'
//                     )` , function (error, resultF) {
//                     if(err){
//                         console.log(err);
//                     }
//                      // var message = `${sender[0].name} with E-mail ${sender[0].email} would like to claim your ${result[0].name}`;
                    
//                     var message = `${sender[0].name} : ${data.message}`;
//                     socketIO.to(users[data.owner_id]).emit("messageReceived", message); 
//                     // return res.redirect('/home-page');
//                 });    
               
//             });      
//         });
//     });
// });
 
http.listen(process.env.PORT || 3000, function () {
    console.log("Server is started.");
});



app.post('/create',function(req,res){
    if(req.body.password != req.body.confirm_password){
        return res.redirect('back');
    }
    
    pool.query(`select count(id) as numOfRows from users where email = "${req.body.email}" `, function(err, result) {
                if (err) {
                    return console.log(err);
                }
                var num = result[0].numOfRows;
                if(num == 0){
                    
                    pool.query(`INSERT INTO users (name,email,phone,pswd) VALUES ("${req.body.name}","${req.body.email}","${req.body.phone}","${req.body.password}")`, function(err, result) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                    return res.render("signIn");
                }else{
                    return res.redirect('back');
                }
            });
});
app.get('/create',function(req,res){
    if(req.isAuthenticated()){
        return res.redirect('/home-page');
    }
    res.render('signIn');
});

app.post('/filter',function(req,res){
    if(req.body.remove != undefined){
        return res.redirect('/home-page');
    }
    var user_id = -1;
    if(req.isAuthenticated()){
        user_id = currentUserId;
    }
    var finalResP = [];
    var finalResWP=[];
    
    var wishlistItems= [];
    // console.log(req.body);
    if(req.body.from != '' && req.body.to != '' && req.body.from != undefined && req.body.to != undefined){
        if(req.body.car != undefined){
            // console.log(`select 'car' as table_name, car.entryTime,car.owner_id,car.name,car.price,car.image,car.location from car where car.price >= ${req.body.from} and car.price <= ${req.body.to} order by car.price asc`);
            pool.query(`select 'car' as table_name, car.entryTime,car.owner_id,car.name,car.price,car.image,car.location from car where car.price >= ${req.body.from} and car.price <= ${req.body.to} order by car.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
            
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResP.push(result);
            });
        }
        if(req.body.pet != undefined){
            pool.query(`select 'pet' as table_name, pet.entryTime,pet.owner_id,pet.name,pet.price,pet.image,pet.location from pet where pet.price >= ${req.body.from} and pet.price <= ${req.body.to} order by pet.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResP.push(result);
            });
           

        }
        if(req.body.phone != undefined){
            pool.query(`select 'phone' as table_name, phone.entryTime,phone.owner_id,phone.name,phone.price,phone.image,phone.location from phone where phone.price >= ${req.body.from} and phone.price <= ${req.body.to} order by phone.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResP.push(result);
            });
           
        }
        if(req.body.other != undefined){
            pool.query(`select 'other' as table_name, other.entryTime,other.owner_id,other.name,other.price,other.image,other.location from other where other.price >= ${req.body.from} and other.price <= ${req.body.to} order by other.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResP.push(result);
            });
            
        }
        if(req.body.furniture != undefined){
            pool.query(`select 'furniture' as table_name, furniture.entryTime,furniture.owner_id,furniture.name,furniture.price,furniture.image,furniture.location from furniture where furniture.price >= ${req.body.from} and furniture.price <= ${req.body.to} order by furniture.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResP.push(result);
            });
            
        }
        if(req.body.bike != undefined){
            pool.query(`select 'bike' as table_name, bike.entryTime,bike.owner_id,bike.name,bike.price,bike.image,bike.location from bike where bike.price >= ${req.body.from} and bike.price <= ${req.body.to} order by bike.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResP.push(result);
            });
            
        }
        if(req.body.home != undefined){
            pool.query(`select 'home' as table_name, home.entryTime,home.owner_id,home.adTitle as name,home.price,home.image,home.location from home where home.price >= ${req.body.from} and home.price <= ${req.body.to} order by home.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResP.push(result);
            });
           
        }
        if(req.body.electronicapp != undefined){
            pool.query(`select 'electronicapp' as table_name, electronicapp.entryTime,electronicapp.owner_id,electronicapp.name,electronicapp.price,electronicapp.image,electronicapp.location from electronicapp where electronicapp.price >= ${req.body.from} and electronicapp.price <= ${req.body.to} order by electronicapp.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResP.push(result);
            });
            
        }
        
    }else{
        if(req.body.car != undefined){
            pool.query(`select 'car' as table_name, car.entryTime,car.owner_id,car.name,car.price,car.image,car.location from car order by car.price asc `,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResWP.push(result);
            });
            
        }
        if(req.body.pet != undefined){
            pool.query(`select 'pet' as table_name, pet.entryTime,pet.owner_id,pet.name,pet.price,pet.image,pet.location from pet order by pet.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResWP.push(result);
            });
            
        }
        if(req.body.phone != undefined){
            pool.query(`select 'phone' as table_name, phone.entryTime,phone.owner_id,phone.name,phone.price,phone.image,phone.location from phone order by phone.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResWP.push(result);
            });
            
        }
        if(req.body.other != undefined){
            pool.query(`select 'other' as table_name, other.entryTime,other.owner_id,other.name,other.price,other.image,other.location from other order by other.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResWP.push(result);
            });
            
        }
        if(req.body.furniture != undefined){
            pool.query(`select 'furniture' as table_name, furniture.entryTime,furniture.owner_id,furniture.name,furniture.price,furniture.image,furniture.location from furniture order by furniture.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResWP.push(result);
            });
            
        }
        if(req.body.bike != undefined){
            pool.query(`select 'bike' as table_name, bike.entryTime,bike.owner_id,bike.name,bike.price,bike.image,bike.location from bike order by bike.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResWP.push(result);
            });
            
        }
        if(req.body.home != undefined){
            pool.query(`select 'home' as table_name, home.entryTime,home.owner_id,home.adTitle as name,home.price,home.image,home.location from home order by home.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResWP.push(result);
            });
            
        }
        if(req.body.electronicapp != undefined){
            pool.query(`select 'electronicapp' as table_name, electronicapp.entryTime,electronicapp.owner_id,electronicapp.name,electronicapp.price,electronicapp.image,electronicapp.location from electronicapp order by electronicapp.price asc`,function(err,result){
                if(err)console.log(err);
                for(let k  = 0;k<result.length;k++){
                    
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                finalResWP.push(result);
            });
            
        }
    }
    pool.query(`select * from wishlist where customer_id = ${currentUserId}`, function(err, wishlist) {
        if(wishlist.length == 0){
    
                
                 pool.query(`select (select name from users where id = r.owner_id) as o_name ,u.name as c_name,u.email as c_email,r.productName,r.entryTime,r.purchaseTime,r.status,r.owner_id,r.customer_id
                 from users as u INNER JOIN requests as r on r.customer_id = u.id`, function(err, request) {
                     if(err)console.log(err);
                     
                     for(let k  = 0;k<request.length;k++){
                         request[k].entryTime = giveDate(request[k].entryTime);
                         if(request[k].purchaseTime != null){
                             request[k].purchaseTime = giveDate(request[k].purchaseTime);
                         }   
                     }
                     
                     if(finalResP.length!=0)return res.render('home',{finalRes:finalResP,user_id:user_id,wishlistItems:wishlistItems,currentUserId:currentUserId,request:request});
                    else return res.render('home',{finalRes:finalResWP,user_id:user_id,wishlistItems:wishlistItems,currentUserId:currentUserId,request:request});
                 }); 
            
                }

            for(let i = 0;i<wishlist.length;i++){
                var refer_name;
                
                var r = `${wishlist[i].tableName}`;
    
                if(wishlist[i].tableName == "home") refer_name = `${r}.adTitle`;
                else refer_name = `${r}.name`;
    
                // console.log(`select ${refer_name},${r}.price,${r}.location from ${wishlist[i].tableName} where id = ${wishlist[i].product_id}`);
                 var d = new Date(wishlist[i].entryTime);
                    
                wishlist[i].entryTime = giveDate(wishlist[i].entryTime);
                
                pool.query(`select ${r}.entryTime,${r}.owner_id, ${refer_name} as name,${r}.price,${r}.image,${r}.location as table_name from ${wishlist[i].tableName} where owner_id = ${wishlist[i].owner_id} and entryTime = '${wishlist[i].entryTime}'`,function(err,result){
                    if(err)console.log(err);
                    result[0].table_name = wishlist[i].tableName;
                    for(let k  = 0;k<result.length;k++){
                        result[k].entryTime = wishlist[i].entryTime;
                    }
                   
                    wishlistItems.push(result);
                    if(i == wishlist.length-1){
                             pool.query(`select (select name from users where id = r.owner_id) as o_name ,u.name as c_name,u.email as c_email,r.productName,r.entryTime,r.purchaseTime,r.status,r.owner_id,r.customer_id
                             from users as u INNER JOIN requests as r on r.customer_id = u.id`, function(err, request) {
                                 if(err)console.log(err);
                                 
                                 for(let k  = 0;k<request.length;k++){
                                     request[k].entryTime = giveDate(request[k].entryTime);
                                     if(request[k].purchaseTime != null){
                                         request[k].purchaseTime = giveDate(request[k].purchaseTime);
                                     }   
                                 }
                                //  console.log(finalResWP);
                                //  console.log(request);
                                 if(finalResP.length!=0)return res.render('home',{finalRes:finalResP,user_id:user_id,wishlistItems:wishlistItems,currentUserId:currentUserId,request:request});
                                 else return res.render('home',{finalRes:finalResWP,user_id:user_id,wishlistItems:wishlistItems,currentUserId:currentUserId,request:request});
                        
                             }); 
                    }
        });
    }

});
});

app.get('/home-page', function(req, res){
    // console.log("hsaf");
    var user_id = -1;
    if(req.isAuthenticated()){
        user_id = currentUserId;
    }
    var tables =["car","pet","phone","other","furniture","bike","electronicapp","home"];
    var finalRes = [];
    var wishlistItems = [];
    var str = "";
    for (let i = 0; i < tables.length; i++) {
        if(tables[i] == "home"){
            str+= `select '${tables[i]}' as table_name, ${tables[i]}.entryTime,${tables[i]}.owner_id,${tables[i]}.adTitle,${tables[i]}.price,${tables[i]}.image,${tables[i]}.location from ${tables[i]}`;
        }else{
            str+= `select '${tables[i]}' as table_name, ${tables[i]}.entryTime,${tables[i]}.owner_id,${tables[i]}.name,${tables[i]}.price,${tables[i]}.image,${tables[i]}.location from ${tables[i]} `;
            str+= `union all `;
        }
      }
    //   console.log(str);
      pool.query(str,function(err,result){
        if(err)console.log(err);
        for(let k  = 0;k<result.length;k++){
            result[k].entryTime = giveDate(result[k].entryTime);
        }
        // console.log(result);
        finalRes.push(result);
        //  console.log(finalRes);

    pool.query(`select * from wishlist where customer_id = ${currentUserId}`,  function(err, wishlist) {
       if(wishlist.length == 0){
        pool.query(`select (select name from users where id = r.owner_id) as o_name ,u.name as c_name,u.email as c_email,r.productName,r.entryTime,r.purchaseTime,r.status,r.owner_id,r.customer_id
        from users as u INNER JOIN requests as r on r.customer_id = u.id`, function(err, request) {
            if(err)console.log(err);
            // console.log(request);
            for(let k  = 0;k<request.length;k++){
                request[k].entryTime = giveDate(request[k].entryTime);
                if(request[k].purchaseTime != null){
                    request[k].purchaseTime = giveDate(request[k].purchaseTime);
                }   
            }
            return res.render('home',{finalRes:finalRes,user_id:user_id,wishlistItems:wishlistItems,currentUserId:currentUserId,request,request}); 
        }); 
       }
       
        for(let i = 0;i<wishlist.length;i++){
            var refer_name;
            
            var r = `${wishlist[i].tableName}`;

            if(wishlist[i].tableName == "home") refer_name = `${r}.adTitle`;
            else refer_name = `${r}.name`;

            var d = new Date(wishlist[i].entryTime);
                    
            wishlist[i].entryTime = giveDate(wishlist[i].entryTime);
            pool.query(`select ${r}.entryTime,${r}.owner_id, ${refer_name} as name,${r}.price,${r}.image,${r}.location as table_name from ${wishlist[i].tableName} where owner_id = ${wishlist[i].owner_id} and entryTime = '${wishlist[i].entryTime}'`,function(err,result){
                if(err)console.log(err);
                result[0].table_name = wishlist[i].tableName;
                
                for(let k  = 0;k<result.length;k++){
                    result[k].entryTime = giveDate(result[k].entryTime);
                }
                
                wishlistItems.push(result);
                if(i == wishlist.length-1){
                    pool.query(`select (select name from users where id = r.owner_id) as o_name ,u.name as c_name,u.email as c_email,r.productName,r.entryTime,r.purchaseTime,r.status,r.owner_id,r.customer_id
                    from users as u INNER JOIN requests as r on r.customer_id = u.id`, function(err, request) {
                        if(err)console.log(err);
                        
                        for(let k  = 0;k<request.length;k++){
                            
                            request[k].entryTime = giveDate(request[k].entryTime);
                            if(request[k].purchaseTime != null){
                                request[k].purchaseTime = giveDate(request[k].purchaseTime);
                            }   
                        }
                        return res.render('home',{finalRes:finalRes,user_id:user_id,wishlistItems:wishlistItems,currentUserId:currentUserId,request,request});   
                        
                    }); 
                }
            });
        }
        // if(currentUserId == -1){
        //     return res.render('home',{finalRes:finalRes,user_id:user_id,wishlistItems:wishlistItems}); }          
    }); 
});
});

app.get('/approve', function(req, res){
    let current = new Date();
    let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
    let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
    let dateTime = cDate + ' ' + cTime;

    pool.query(`UPDATE requests 
    SET purchaseTime = CASE WHEN status = 'pending'
                           THEN '${dateTime}'
                           ELSE purchaseTime
                      END,
        status = CASE WHEN status = 'pending'
                           THEN 'approved'
                           ELSE status
                      END
    WHERE owner_id= ${currentUserId} and entryTime = '${req.query.entryTime}'`, function(err, result) {
        if(err)console.log(err);
        req.flash('warning',"Transaction updated");
        return res.redirect('/home-page');
    }); 
});
app.get('/reject', function(req, res){
    pool.query(`delete from requests where owner_id = ${currentUserId} and entryTime = '${req.query.entryTime}' and status = 'pending'`, function(err, result) {
        if(err)console.log(err);
        req.flash('error',"Request declined");
        return res.redirect('/home-page');
    }); 
});




app.get('/wishlistA', function(req, res){
    if(!req.isAuthenticated()){
        //try to redirect
        return res.render('signIn');
    }
    
    pool.query(`INSERT  wishlist (customer_id,owner_id,tableName,entryTime) SELECT  ${currentUserId},${req.query.owner_id},'${req.query.name}', '${req.query.entryTime}' WHERE NOT EXISTS 
    (   SELECT  1
        FROM    wishlist 
        WHERE   customer_id = ${currentUserId}
        AND     owner_id = ${req.query.owner_id}
        AND     tableName = '${req.query.name}'
        AND 	entryTime = '${req.query.entryTime}'
    );`, function(err, result) {
        if(err)console.log(err);
        req.flash('success',"Added to Wishlist");
        return res.redirect('/home-page');
    }); 
});

app.get('/wishlistD', function(req, res){
    if(!req.isAuthenticated()){
        //try to redirect
        return res.render('signIn');
    }
    pool.query(`delete from wishlist where customer_id = ${currentUserId} and tableName = "${req.query.name}" and entryTime = '${req.query.entryTime}'`, function(err, result) {
        if(err)console.log(err);
        req.flash('error',"Removed from Wishlist");
        return res.redirect('/home-page');
    }); 
});

app.get('/category-page', function(req, res){
    if(!req.isAuthenticated()){
        return res.redirect('/');
    }
    return res.render('categoryPage');
});

app.get('/sign-out', function(req, res){
    currentUserId = -1;
    req.logOut();
    req.flash('warning','You have logged out successfully');
    return res.redirect('/home-page');
});


//pass 2 things , ie. one the person trying to enter and other the profile:id same as before.
app.get('/profile',function(req,res){
    if(!req.isAuthenticated()){
        //try to redirect
        return res.render('signIn');
    }
    var deleteBtn = -1;
    pool.query(`Select * from ${req.query.name} where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result1) {
        if (err) {
            console.log(err);
        }
        
        result1[0].entryTime = giveDate(result1[0].entryTime);
       
        
        if (currentUserId == result1[0].owner_id ){
            deleteBtn = 0;
            return res.render('profileHandler',{data:result1,name:req.query.name,deleteBtn:deleteBtn,owner_id:req.query.owner_id,currentUserId:currentUserId});
            
        }else{
            pool.query(`Select * from users where id = ${result1[0].owner_id}`, function(err, result2) {
                if (err) {
                    return console.log(err);
                }
                return res.render('profileHandler',{data:result1,name:req.query.name,userInfo:result2,deleteBtn:deleteBtn,owner_id:req.query.owner_id,currentUserId:currentUserId});
                // return res.render('profileHandler',{data:result1,name:null,userInfo:result2,deleteBtn:deleteBtn});
                
            });   
        }       
    });   
});
app.post('/update-pdt',function(req,res){
    
        if(req.body.name != undefined && req.body.name != ''){
            pool.query(`update ${req.query.name} set name = "${req.body.name}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.adTitle != undefined && req.body.adTitle != ''){
            pool.query(`update ${req.query.name} set adTitle = "${req.body.adTitle}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.bedRooms != undefined && req.body.bedRooms != ''){
            pool.query(`update ${req.query.name} set bedRooms = "${req.body.bedRooms}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.furnishing != undefined && req.body.furnishing != ''){
            pool.query(`update ${req.query.name} set furnishing = "${req.body.furnishing}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.superBuidupArea != undefined && req.body.superBuidupArea != ''){
            pool.query(`update ${req.query.name} set superBuidupArea = "${req.body.superBuidupArea}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.carpetArea != undefined && req.body.carpetArea != ''){
            pool.query(`update ${req.query.name} set carpetArea = "${req.body.carpetArea}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.floors != undefined && req.body.floors != ''){
            pool.query(`update ${req.query.name} set floors = "${req.body.floors}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.carParking != undefined && req.body.carParking != ''){
            pool.query(`update ${req.query.name} set carParking = "${req.body.carParking}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.facing != undefined && req.body.facing != ''){
            pool.query(`update ${req.query.name} set facing = "${req.body.facing}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }

        if(req.body.purchaseYear != undefined && req.body.purchaseYear != ''){
            pool.query(`update ${req.query.name} set purchaseYear = "${req.body.purchaseYear}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.age != undefined && req.body.age != ''){
            pool.query(`update ${req.query.name} set age = "${req.body.age}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.fuel != undefined && req.body.fuel != ''){
            pool.query(`update ${req.query.name} set fuel = "${req.body.fuel}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.transmission != undefined && req.body.transmission != ''){
            pool.query(`update ${req.query.name} set transmission = "${req.body.transmission}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.kmDriven != undefined && req.body.kmDriven != ''){
            pool.query(`update ${req.query.name} set kmDriven = "${req.body.kmDriven}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.noOfOwners != undefined && req.body.noOfOwners != ''){
            pool.query(`update ${req.query.name} set noOfOwners = "${req.body.noOfOwners}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.price != undefined && req.body.price != ''){
            pool.query(`update ${req.query.name} set price = "${req.body.price}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.body.description != undefined && req.body.description != ''){
            pool.query(`update ${req.query.name} set description = "${req.body.description}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
        if(req.files != null){
            pool.query(`update ${req.query.name} set image = "${req.files.image.name}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            }); 
            req.files.image.mv(__dirname+'/public/images/'+req.files.image.name,function(err){
                if(err)return console.log(err);
            }); 
        }
        if(req.body.location != undefined && req.body.location != ''){
            pool.query(`update ${req.query.name} set location = "${req.body.location}" where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
                if (err) {return console.log(err);}
            });   
        }
    return res.redirect(`/profile/?owner_id=${req.query.owner_id}&name=${req.query.name}&entryTime=${req.query.entryTime}`);
});

app.get('/delete-pdt',function(req,res){
    pool.query(`delete from ${req.query.name} where owner_id = ${req.query.owner_id} and entryTime = '${req.query.entryTime}'`, function(err, result) {
        if (err) {
            return console.log(err);
        }
        req.flash('error','Product Deleted');
        return res.redirect('/home-page');
    });   
});

app.post('/create-session', passport.authenticate(
    'local',
    {failureRedirect: '/create'},
), function(req,res){
    req.flash('success','You have logged in successfully');
    return res.redirect('/home-page');
});


app.get("/form-page",function(req,res){
    if(!req.isAuthenticated()){
        //try to redirect
        return res.render('signIn');
    }
    return res.render('form-page',{name:req.query.name});
});


app.post('/add-pdt',function(req,res){
    // console.log(req.query.name);
    // console.log(req.files);
    var file = req.files.image;
    file.mv(__dirname+'/public/images/'+file.name,function(err){
        if(err)return console.log(err);
    });
    let current = new Date();
    let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
    let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
    let dateTime = cDate + ' ' + cTime;
    
    var argmnt;
    if(req.query.name =="car"){
        var trans;
        if(req.body.transmission == ''){
            trans = null;
        }else {
            trans=`${req.body.transmission}`;
        }
        if(req.body.kmDriven == '')req.body.kmDriven = null;
        if(req.body.noOfOwners == '')req.body.noOfOwners = null;
        argmnt=`insert into car (name,purchaseYear,fuel,transmission,kmDriven,noOfOwners,description,price,image, location, owner_id, entrytime) values("${req.body.name}",${req.body.purchaseYear},"${req.body.fuel}","${trans}",${req.body.kmDriven}, ${req.body.noOfOwners},"${req.body.description}", ${req.body.price},"${file.name}","${req.body.location}", ${currentUserId}, '${dateTime}')`;
    }
    if(req.query.name =="phone"){
        if(req.body.noOfOwners == '')req.body.noOfOwners = null;
        argmnt=`insert into phone (name,purchaseYear,noOfOwners,description,price,image, location, owner_id, entrytime) values("${req.body.name}",${req.body.purchaseYear}, ${req.body.noOfOwners},"${req.body.description}", ${req.body.price},"${file.name}","${req.body.location}", ${currentUserId}, '${dateTime}')`;
    }
    if(req.query.name =="bike"){
        if(req.body.kmDriven == '')req.body.kmDriven = null;
        if(req.body.noOfOwners == '')req.body.noOfOwners = null;
        argmnt=`insert into bike (name,purchaseYear,kmDriven,noOfOwners,description,price,image, location, owner_id, entrytime) values("${req.body.name}",${req.body.purchaseYear},${req.body.kmDriven}, ${req.body.noOfOwners},"${req.body.description}", ${req.body.price},"${file.name}","${req.body.location}", ${currentUserId}, '${dateTime}')`;
    }
    if(req.query.name =="electronicapp"){
        if(req.body.noOfOwners == '')req.body.noOfOwners = null;
        argmnt=`insert into electronicapp (name,purchaseYear,noOfOwners,description,price,image, location, owner_id, entrytime) values("${req.body.name}",${req.body.purchaseYear}, ${req.body.noOfOwners},"${req.body.description}", ${req.body.price},"${file.name}","${req.body.location}", ${currentUserId}, '${dateTime}')`;
    }
    if(req.query.name =="other"){
        
        argmnt=`insert into other (name,description,price,image, location, owner_id, entrytime) values("${req.body.name}","${req.body.description}", ${req.body.price},"${file.name}","${req.body.location}", ${currentUserId}, '${dateTime}')`;
    }
    if(req.query.name =="furniture"){
        
        argmnt=`insert into furniture (name,description,price,image, location, owner_id, entrytime) values("${req.body.name}","${req.body.description}", ${req.body.price},"${file.name}","${req.body.location}", ${currentUserId}, '${dateTime}')`;
    }
    if(req.query.name =="home"){
        var fur;
        if(req.body.furnishing == ''){
            fur = null;
        }else {
            fur=`${req.body.furnishing}`;
        }
        if(req.body.floors == '')req.body.floors= null;
        if(req.body.carParking == '')req.body.carParking= null;
        argmnt=`insert into home (adTitle,bedRooms,furnishing ,superBuidupArea,carpetArea,floors,carParking,facing,description,price,image, location, owner_id, entrytime) values("${req.body.adTitle}",${req.body.bedRooms},${fur},${req.body.superBuidupArea},${req.body.carpetArea}, ${req.body.floors},${req.body.carParking},"${req.body.facing}","${req.body.description}", ${req.body.price},"${file.name}","${req.body.location}", ${currentUserId}, '${dateTime}')`;
    }
    if(req.query.name =="pet"){
        argmnt=`insert into pet (name,age,description,price,image, location, owner_id, entrytime) values("${req.body.name}",${req.body.age},"${req.body.description}", ${req.body.price},"${file.name}","${req.body.location}", ${currentUserId}, '${dateTime}')`;
    }
    
    pool.query(argmnt, function(err, result) {
        if (err) {
            return console.log(err);
        }
        pool.query(`select * from users where id = ${currentUserId}`, function(err, resultx) {
            if (err) {
                return console.log(err);
            }
            var viewName = resultx[0].id+"_";
            var argm0 = `DROP USER IF EXISTS '${viewName}'@'localhost';`
            var argm1 = `CREATE USER '${viewName}'@'localhost' IDENTIFIED BY '${resultx[0].pswd}';`;
            var argm2 = `CREATE OR REPLACE SQL SECURITY DEFINER VIEW ${viewName} AS SELECT * FROM ${req.query.name} WHERE (owner_id = ${currentUserId});`;
            var argm3 = `GRANT SELECT,UPDATE,DELETE ON ${viewName} TO ${viewName}@localhost;`;
            pool.query(argm0, function(err, result) {
                pool.query(argm1, function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    pool.query(argm2, function(err, result) {
                        if (err) {
                            console.log(err);
                        }
                        pool.query(argm3, function(err, result) {
                            if (err) {
                                console.log(err);
                            }
                        });
                });
                });
            });
            
        });
    

        req.flash('success','Product Uploaded Successfully');
        return res.redirect('/home-page');
    });

});

app.listen(port, function(err){
    if (err) {
        console.log("Error in running the server", err);
    }
    console.log('Server is up on the port->', port);
});
