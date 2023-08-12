const express = require('express');
const router = express.Router();
const pool = require('../db/db');
/**
 *  해야할것:
 *
 *  - 중복 회원 조회 기능
 *  - 로그인 세션 기능(완료)
 *
 *
 */

// 로그인 페이지
router.get('/signin', async (req, res) => {
    res.render('signin');
});

// 로그인 기능
router.post('/signin', async (req, res) => {
    const { user_id, password } = req.body;
    //   console.log("user_id:", user_id, "password:", password);

    try {
        const login = await pool.query(
            'select * from book.user where user_id = ? and password = ?',
            [user_id, password]
        );

        console.log('login:', login[0]);

        if (login[0].length === 0) {
            return res.send(
                `<script type="text/javascript">
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
        location.href='./signin';
        </script>`
            );
            res.redirect('/signin');
        } else {
            req.session.user_id = user_id;
            console.log(req.session.user_id);
        }
        return res.redirect('/main');
    } catch (error) {
        console.log(error);
        res.send(
            `<script type="text/javascript">
        alert("아이디 또는 비밀번호가 올바르지 않습니다."); 
        location.href='./signin';
        </script>`
        );
    }
});

// 로그아웃 기능
router.get('/logout', async (req, res) => {
    try {
        req.session.destroy(function () {
            req.session;
        });
        return res.send(
            `<script type = "text/javascript" >alert("로그아웃되었습니다.");location.href='/main';</script>`
        );
    } catch (error) {
        console.log(error);
    }
});

// 회원가입 페이지
router.get('/signup', async (req, res) => {
    res.render('signup');
});

// 회원가입 기능
router.post('/signup', async (req, res) => {
    const { user_id, password, user_name } = req.body;
    console.log(user_id, password, user_name);
    try {
        const users = await pool.query('insert into book.user values(?, ?, ?)', [
            user_id,
            password,
            user_name,
        ]);
        console.log('user_id:', user_id);
        return res.redirect('/');
    } catch (error) {
        console.log(error);
    }
});

// 책 리스트 조회
// router.get("/bookList", async (req, res) => {
//   // const book = await pool.query("select * from book.book_list;");
//   // console.log(book[0]);
//   res.render("booklist", { book: book[0] });
// });

// 카드 추가 페이지
router.get('/addCard', async (req, res) => {
    const sess = req.session.user_id;
    res.render('addCard');
});

// 카드 추가 기능
router.post('/addCard', async (req, res) => {
    const sess = req.session.user_id;
    const { card_number, card_date, card_kind } = req.body;

    try {
        const query = await pool.query('insert into book.card values(?, ?, ?, ?)', [
            card_number,
            card_date,
            card_kind,
            sess,
        ]);
        console.log('card_number:', card_number, 'card_date:', card_date, 'card_kind:', card_kind);
        console.log('user_id:', sess);
        console.log('query:', query);
        return res.send(
            `<script type = "text/javascript" >alert("카드가 추가되었습니다.");location.href='/user/myPage';</script>`
        );
    } catch (error) {
        console.log(error);
        return res.send(
            `<script type = "text/javascript" >alert("카드 정보를 확인해주세요.");location.href='/user/addCard';</script>`
        );
    }
});

// 배송지 주소 추가 페이지
router.get('/addparCel', async (req, res) => {
    res.render('addParcel');
});

router.post('/addParcel', async (req, res) => {
    const sess = req.session.user_id;
    const { parcel_number, parcel_address1, parcel_address2 } = req.body;

    console.log(
        'parcel_number:',
        parcel_number,
        'parcel_address1:',
        parcel_address1,
        'parcel_address2:',
        parcel_address2
    );

    try {
        if (parcel_number.length != 5) {
            return res.send(`
        <script type = "text/javascript" >alert("배송지 번호를 다시 확인해주세요.");location.href='/user/myPage';</script>
        `);
        }
        if (Number(parcel_number)) {
            const parcel = await pool.query('insert into book.parcel values(?, ?,?,?)', [
                parcel_number,
                parcel_address1,
                parcel_address2,
                sess,
            ]);
            return res.send(
                `<script type = "text/javascript" >alert("배송지 주소를 추가하였습니다.");location.href='/user/myPage';</script>`
            );
        } else {
            return res.send(
                `<script type = "text/javascript" >alert("배송지를 다시 확인해주세요.");location.href='/user/myPage';</script>`
            );
        }
    } catch (error) {
        console.log(error);
    }
});

// 마이페이지
router.get('/myPage', async (req, res) => {
    const sess = req.session.user_id;
    const card = await pool.query('select * from book.card where user_user_id = ?;', [sess]);
    const parcel = await pool.query('select * from book.parcel where user_user_id = ?', [sess]);
    console.log('parcel:', parcel[0]);

    // console.log('sess:', sess);
    // console.log('card:', card[0]);
    res.render('myPage', { card: card[0], parcel: parcel[0] });
});

// 도서 상세 페이지
router.get('/bookdetail/:book_number', async (req, res) => {
    const sess = req.session.user_id;
    // console.log(req.params);
    const { book_number } = req.params;
    const book = await pool.query('SELECT * FROM book.book_list where book_number = ?;', [
        book_number,
    ]);

    // console.log(book[0]);
    try {
        res.render('bookDetail', { book: book[0], sess: sess });
    } catch (error) {
        console.log(error);
    }
});

// 장바구니 담기/추가
router.post('/addItem/:book_number', async (req, res) => {
    // console.log("???", req.params);
    // console.log(req.body);
    const { rest, book_number } = req.body;
    const sess = req.session.user_id;
    // const { book_number } = req.params;

    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    let date = today.getDate();
    const wdate = year + '-' + month + '-' + date;
    const bookAlready = await pool.query(
        'select * from book.basket where book_list_book_number = ?',
        [book_number]
    );
    // console.log('bookAlready:', bookAlready[0]);
    try {
        if (bookAlready[0].length != 0) {
            // console.log('rest:', rest);
            // console.log('restAlready:', bookAlready[0][0].rest);
            // console.log('result:', parseInt(rest) + parseInt(bookAlready[0][0].rest));
            const result = parseInt(rest) + parseInt(bookAlready[0][0].rest);
            const basket = await pool.query(
                'update book.basket set rest = ? where user_user_id = ? and book_list_book_number =?',
                [result, sess, book_number]
            );
            console.log(basket[0]);
        } else {
            const basket = await pool.query('insert into book.basket values( null, ?,?, ?, ?)', [
                wdate,
                rest,
                book_number,
                sess,
            ]);
            console.log(basket[0]);
        }
        // console.log(basket[0]);
        return res.send(
            `<script type = "text/javascript" >alert("장바구니에 담았습니다.");location.href='/main';</script>`
        );
    } catch (error) {
        console.log(error);
    }
    res.redirect('/main');
});

// 장바구니 조회 (완료)
// join 사용
router.get('/basket', async (req, res) => {
    const sess = req.session.user_id;

    const basket = await pool.query(
        'SELECT * FROM book.basket a inner join book.book_list b on a.book_list_book_number = b.book_number and a.user_user_id = ?;',
        [sess]
    );

    console.log(basket[0]);

    res.render('basket', { basket: basket[0], sess: sess });

    /**
     *
     * 수량을 기준으로 데이터를 땡겨와야될지 , 장바구니 담기에서 애초에 개수를 추가해야될지.
     * 수량을 기준으로 땡겨오는걸로 ( 구현완료)
     * basket 테이블 rest 속성값 추가
     */
});

// 검색
router.post('/search', async (req, res) => {
    const { key } = req.body;
    const sess = req.session.user_id;

    // console.log(key);
    const search = await pool.query('select * from book.book_list where book_name like ?', [
        '%' + key + '%',
    ]);
    if (key.length === 0) {
        return res.send(`<script type = "text/javascript">
    alert("검색어를 입력해주세요.");
    location.href='/main';
    </script>`);
    } else {
        return res.render('booksearch', { book: search[0], sess: sess });
    }
});

module.exports = router;
