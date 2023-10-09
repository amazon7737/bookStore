const express = require('express');
const router = express.Router();
const pool = require('../db/db');
/**
 *  해야할것:
 *
 *  - 중복 회원 조회 기능 (폐기 => 구현 필요성 못느낌)
 *  - 로그인 세션 기능 (완료)
 *  - 주문서 작성
 *  - 책 상세페이지에서 바로 구매 기능
 *  - 장바구니에 추가된 물품 바로 구매 기능
 *  - 주문 내역 기능(완료)
 *  - 배송지 목록 삭제 , 수정 기능(완료)
 *  - 카드 목록 삭제 , 수정 기능(완료)
 *  - 장바구니 물품 삭제 기능
 *  - 장바구니 ui 수정 => yes24 반영
 *  - 장바구니 물품 삭제
 *  - 페이지들 ui 검사
 *  - 주문내역 페이지
 *  - 책 이미지 넣기 작업 (완료)
 * 
 */

// 로그인 페이지
router.get('/signin', async (req, res) => {
    res.render('signin');
});

// 로그인 기능
router.post('/signin', async (req, res) => {
    const { user_id, user_pw } = req.body;
    //   console.log("user_id:", user_id, "password:", password);

    try {
        const login = await pool.query(
            'select * from book.user where user_id = ? and user_pw = ?',
            [user_id, user_pw]
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
        return res.redirect('/');
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
            `<script type = "text/javascript" >alert("로그아웃되었습니다.");location.href='/';</script>`
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
    const { user_id, user_pw, user_name } = req.body;
    console.log(user_id, user_pw, user_name);
    try {
        const users = await pool.query('insert into book.user values(?, ?, ?)', [
            user_id,
            user_pw,
            user_name,
        ]);
        console.log('user_id:', user_id);
        return res.redirect('/');
    } catch (error) {
        if (user_id.length == 0 || user_pw.length == 0 || user_name.length == 0) {
            return res.send(
                `<script type = "text/javascript">alert("빈칸을 확인해주세요."); location.href = '/user/signin';</script>`
            );
        } else {
            return res.send(
                `<script type = "text/javascript" >alert("이미 존재하는 회원입니다.");location.href='/user/signin';</script>`
            );
        }
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

        const query = await pool.query('insert into book.card values(null, ?, ?, ?, ?)', [
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

//카드 수정 페이지
router.post("/card/update/:target", async(req, res) => {
    const sess = req.session.user_id;
    const pid = req.body.pid;
    const card = await pool.query("select * from card where user_user_id = ? and card_id =?", [
        sess, pid
    ]);
    console.log(card[0]);
    console.log(card[0][0]);

    res.render("editCard", {
        card: card[0],
        pid: req.body.pid
    });
});

// 카드 수정 기능
router.post("/editCard", async(req, res) => {
    const sess = req.session.user_id;
    const pid = req.body.pid;
    const {card_number, card_date, card_kind} = req.body;
    console.log(card_number , card_date, card_kind);
    try{

    const CardUpdate = await pool.query("update card set card_num=?, card_date=?, card_type=?;",[

    card_number, card_date, card_kind

    ]);
    console.log(CardUpdate[0]);

    return res.send(`<script type = "text/javascript">
    alert("카드 정보가 수정 되었습니다.");
    location.href='/user/myPage';
    </script>`);

    }catch(err){
        console.log(err);
    }

})

// 카드 삭제 기능

router.get("/cardDel/:target" , async(req,res) => {

    const target = req.params.target;
    try {
        const cardDel = await pool.query("delete from card where card_id = ?", [
            target
        ]);
        res.redirect("/user/myPage");
    }catch (error){
        console.log(error);
        res.redirect("/user/myPage");
    }

});





// 배송지 주소 추가 페이지
router.get('/addParcel', async (req, res) => {
    res.render('addParcel');
});



// 배송지 주소 추가 기능
router.post('/addParcel', async (req, res) => {
    const sess = req.session.user_id;
    const { address_id, address_basicaddress, address_detailaddress } = req.body;

    console.log(
        'address_id:',
        address_id,
        'address_basicaddress:',
        address_basicaddress,
        'address_detailaddress:',
        address_detailaddress
    );

    try {
        if (address_id.length != 5) {
            return res.send(`
        <script type = "text/javascript" >alert("배송지 번호를 다시 확인해주세요.");location.href='/user/myPage';</script>
        `);
        }

        if (Number(address_id)) {
            const address = await pool.query('insert into book.address values(null,?, ?,?,?)', [
                address_id,
                address_basicaddress,
                address_detailaddress,
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

// 배송지 수정 페이지
router.post("/address/update/:target", async(req ,res) => {
    const pid = req.body.pid;
    const sess = req.session.user_id;
    const address = await pool.query("select * from address where user_user_id = ? and address_id = ?",[
        sess, pid
    ]);
    console.log(address[0]);
    res.render("editParcel" ,{ address : address[0], sess:sess});
})


// 배송지 수정 기능
router.post("/editParcel", async (req, res) => {
    const sess = req.session.user_id;
    const pid = req.body.pid;
    const {address_postnum , address_basicaddress, address_detailaddress} = req.body;

    console.log(address_postnum, address_basicaddress,address_detailaddress);

    try{

    const addressUpdate = await pool.query("update address set address_postnum = ?, address_basicaddress = ?, address_datailaddress = ?;",[

        Number(address_postnum), address_basicaddress, address_detailaddress

    ]);

    console.log("!!", addressUpdate[0]);

        return res.send(`<script type = "text/javascript">
    alert("배송지 정보가 수정 되었습니다.");
    location.href='/user/myPage';
    </script>`);

    }catch (err){
        console.log(err);
        return res.send(`<script type = "text/javascript">
    alert("배송지 정보를 다시 확인해주세요.");
        location.href='/user/myPage';
    </script>`);
    }


});

// 배송지 삭제 기능
router.get("/parcelDel/:target" , async(req,res) => {

    const target = req.params.target;
    try {
        const cardDel = await pool.query("delete from address where address_id = ?", [
            target
        ]);
        res.redirect("/user/myPage");
    }catch (error){
        console.log(error);
        res.redirect("/user/myPage");
    }

});




// 마이페이지
router.get('/myPage', async (req, res) => {
    const sess = req.session.user_id;
    const card = await pool.query('select * from book.card where user_user_id = ?;', [sess]);
    const address = await pool.query('select * from book.address where user_user_id = ?', [sess]);
    console.log('card:', card[0]);
    console.log('address:', address[0]);

    // console.log('sess:', sess);
    // console.log('card:', card[0]);
    res.render('myPage', { card: card[0], address: address[0], sess:sess });
});


// 도서 상세 페이지
router.get('/bookdetail/:book_number', async (req, res) => {
    const sess = req.session.user_id;
    // console.log(req.params);
    const { book_number } = req.params;
    const book = await pool.query('SELECT * FROM book.book where book_number = ?;', [book_number]);

    console.log(book[0]);
    try {
        res.render('bookDetail', { book: book[0], sess: sess });
    } catch (error) {
        console.log(error);
    }
});



// 장바구니 담기 / 추가
router.post('/addItem/:book_number', async (req, res) => {

    // console.log("???", req.params);
    // console.log(req.body);

    console.log(req.body);

    const {count, book_number, book_price} = req.body;

    // 책 개수 0개 이하 알림

    if (count <= 0){
        return res.send(`<script type = "text/javascript">alert("책을 다시 담아주세요."); history.go(-1);</script>`)
    }

    // console.log(count, book_number, book_price);
    const sess = req.session.user_id;


    // 날짜 생성
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    let date = today.getDate();
    const wdate = year + '-' + month + '-' + date;


    try{
        const basket = await pool.query("select * from basket where user_user_id = ?",[
            sess
        ]);

        // 회원님의 장바구니가 없으면
        if (basket[0].length === 0){
            const basketMake = await pool.query("insert into basket values(null, ?,?)",[
                wdate,sess
            ]);
        }

        // 바구니 id 검색
        const basketData = await pool.query("select * from basket where user_user_id =?",[
            sess
        ]);

        console.log("basketData", basketData[0]);
        const basketId = basketData[0][0].basket_id;

        // 이미 장바구니에 담은 물건인가?
        const basketSearch = await pool.query("select count(*) cnt from basket_list where basket_basket_id =? and book_book_number=?",[
            basketId, book_number
        ]);
        const cnt = basketSearch[0][0].cnt;
        console.log("search:",basketSearch[0][0].cnt);
        if (cnt >= 1){
            console.log("이미 있는책이네요");
            const bookcnt = await pool.query("select book_count as cnt, book_price as price from basket_list where book_book_number=? and basket_basket_id =?",[
                book_number, basketId
            ]);

            const bookcnt2 = String(Number(bookcnt[0][0].cnt) + Number(count));
            const totalPrice = String(Number(bookcnt[0][0].price) * Number(bookcnt2));
            console.log("!!!,",bookcnt2, totalPrice);
            const basketUpdate = await pool.query("update basket_list set book_count=?,book_price=? where basket_basket_id = ? and book_book_number=?;",[
                bookcnt2 , totalPrice , basketId,Number(book_number)
            ]);
            // console.log("!!!",basketUpdate[0]);
        }else{
            console.log("그냥 추가했어요")
            const basketInsert = await pool.query("insert into basket_list values(?,?,?,?)",[
                book_number, basketId, count, book_price
            ])
            // console.log("basketInsert:", basketInsert[0]);
        }
        return res.send(`<script type = "text/javascript"> alert("장바구니에 담았습니다.)"); location.href="/";</script>`);

    }catch(err){
        console.log(err);
    }

});



// 장바구니 조회 (수정사항 발견) join 2번
router.get('/basket', async (req, res) => {
    const sess = req.session.user_id;
    
    const basket = await pool.query(
        'SELECT b.book_count, b.book_price, c.book_name FROM book.basket a inner join book.basket_list b on a.basket_id = b.basket_basket_id inner join book.book c on c.book_number=b.book_book_number;',
    );
    console.log(basket[0]);

    // res.render('basket', { basket: basket[0], sess: sess });
    res.render("basket", {basket: basket[0], sess:sess});

    /**
     *
     * 수량을 기준으로 데이터를 땡겨와야될지 , 장바구니 담기에서 애초에 개수를 추가해야될지. (구현완료)
     * 수량을 기준으로 땡겨오는걸로 ( 구현완료)
     * basket 테이블 rest 속성값 추가 (완료)
     * basket list , basket 테이블 폭발 => 외래키 제약조건 쪽에 문제가 발생한것 같음. (단순 변수 이름문제로 확인)
     * 
     */

});

// 장바구니 물품 삭제



// 검색
router.post('/search', async (req, res) => {
    const { key } = req.body;
    const sess = req.session.user_id;

    // console.log(key);
    const search = await pool.query('select * from book.book where book_name like ?', [
        '%' + key + '%',
    ]);
    if (key.length === 0) {
        return res.send(`<script type = "text/javascript">
    alert("검색어를 입력해주세요.");
    location.href='/';
    </script>`);
    } else {
        return res.render('booksearch', { book: search[0], sess: sess });
    }
});

module.exports = router;
