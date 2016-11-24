function chemistry(req, res, next) {
	console.log('chemistry');
    res.render('helloworld', { title2: 'Hello, World!' });
	res.status(201);
}

exports.chemistry = chemistry






























