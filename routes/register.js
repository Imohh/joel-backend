const express = require('express');
const router = express.Router();

router.post('/register', (req,res) => {
	const {username, password} = req.body;
	res.json({requestData:{username,password}})
}

module.exports = router;