module.exports.setFlash = function(req, res, next){
    res.locals.flash = {
        'success': req.flash('success'),
        'warning':req.flash('warning'),
        'info':req.flash('info'),
        'error': req.flash('error')
    }

    next();
}