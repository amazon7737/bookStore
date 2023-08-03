const express = require("express");
const router = express.Router();
const pool = require("../db/db");
/**
 *  해야할것:
 *
 *  - 중복 회원 조회 기능
 *  - 로그인 세션 기능(완료)
 *
 *
 */

// 로그인 페이지
router.get("/signin", async (req, res) => {
  res.render("signin");
});

// 로그인 기능
router.post("/signin", async (req, res) => {
  const { user_id, password } = req.body;
  //   console.log("user_id:", user_id, "password:", password);

  try {
    const login = await pool.query(
      "select * from book.user where user_id = ? and password = ?",
      [user_id, password]
    );

    console.log("login:", login[0]);

    if (login[0].length === 0) {
      return res.send(
        `<script type="text/javascript">
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
        location.href='./signin';
        </script>`
      );
      res.redirect("/signin");
    } else {
      req.session.user_id = user_id;
      console.log(req.session.user_id);
    }
    return res.redirect("/main");
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
router.get("/logout", async (req, res) => {
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
router.get("/signup", async (req, res) => {
  res.render("signup");
});

// 회원가입 기능
router.post("/signup", async (req, res) => {
  const { user_id, password, user_name } = req.body;
  console.log(user_id, password, user_name);
  try {
    const users = await pool.query("insert into book.user values(?, ?, ?)", [
      user_id,
      password,
      user_name,
    ]);
    console.log("user_id:", user_id);
    return res.redirect("/");
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
router.get("/addCard", async (req, res) => {
  res.render("addCard");
});

// 배송지 주소 추가 페이지
router.get("/parCel", async (req, res) => {
  res.render("addParcel");
});

// 마이페이지

// 도서 상세 페이지
router.get("/bookdetail/:book_number", async (req, res) => {
  const sess = req.session.user_id;
  // console.log(req.params);
  const { book_number } = req.params;
  const book = await pool.query(
    "SELECT * FROM book.book_list where book_number = ?;",
    [book_number]
  );
  // console.log(book[0]);
  try {
    res.render("bookDetail", { book: book[0], sess: sess });
  } catch (error) {
    console.log(error);
  }
});

// 장바구니 담기
router.get("/addItem/:book_number", async (req, res) => {
  // console.log("???", req.params);
  const sess = req.session.user_id;
  const { book_number } = req.params;
  // console.log("book_number:", book_number);
  // const book = await pool.query(
  //   "select * from book.book_list where book_number = ?",
  //   [book_number]
  // );

  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();
  let date = today.getDate();
  const wdate = year + "-" + month + "-" + date;
  try {
    const basket = await pool.query(
      "insert into book.basket values( null, ?, ?, ?)",
      [wdate, book_number, sess]
    );
    // console.log(basket[0]);
    return res.send(
      `<script type = "text/javascript" >alert("장바구니에 담았습니다.");location.href='/main';</script>`
    );
  } catch (error) {
    console.log(error);
  }
  res.redirect("/main");
});

// 장바구니 조회 (작업중)
// join 사용
router.get("/basket", async (req, res) => {
  const sess = req.session.user_id;

  const basket = await pool.query(
    "SELECT * FROM book.basket a inner join book.book_list b on a.book_list_book_number = b.book_number and a.user_user_id = ?;",
    [sess]
  );

  console.log(basket[0]);

  res.render("basket", { basket: basket[0] });

  /**
   *
   * 수량을 기준으로 데이터를 땡겨와야될지 , 장바구니 담기에서 애초에 개수를 추가해야될지.
   */
});

// 검색
router.post("/search", async (req, res) => {
  const { key } = req.body;
  const sess = req.session.user_id;

  // console.log(key);
  const search = await pool.query(
    "select * from book.book_list where book_name like ?",
    ["%" + key + "%"]
  );
  if (key.length === 0) {
    return res.send(`<script type = "text/javascript">
    alert("검색어를 입력해주세요.");
    location.href='/main';
    </script>`);
  } else {
    return res.render("booksearch", { book: search[0], sess: sess });
  }
});

module.exports = router;
