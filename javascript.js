// ==========================================
// INICIALIZAÇÃO E DADOS NO LOCALSTORAGE
// ==========================================
const defaultLibrarian = {
    name: "Bibliotecário Chefe",
    user: "admin",
    pass: "1234"
};

function getStorage(key, fallback) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
}

function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Garante que existe um bibliotecário padrão
if (!localStorage.getItem('biblio_librarian')) {
    setStorage('biblio_librarian', defaultLibrarian);
}

let books = getStorage('biblio_books', []);
let users = getStorage('biblio_users', []);
let loans = getStorage('biblio_loans', []);

// ==========================================
// SISTEMA DE LOGIN E SESSÃO
// ==========================================
const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');

function checkAuth() {
    const isLogged = sessionStorage.getItem('biblio_logged');
    if (isLogged === 'true') {
        loginScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        loadAllData();
    } else {
        loginScreen.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userIn = document.getElementById('login-user').value.trim();
    const passIn = document.getElementById('login-pass').value.trim();
    const librarian = getStorage('biblio_librarian', defaultLibrarian);

    if (userIn === librarian.user && passIn === librarian.pass) {
        sessionStorage.setItem('biblio_logged', 'true');
        document.getElementById('login-error').textContent = '';
        checkAuth();
    } else {
        document.getElementById('login-error').textContent = 'Usuário ou senha incorretos!';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('biblio_logged');
    checkAuth();
});

// ==========================================
// NAVEGAÇÃO ENTRE ABAS
// ==========================================
const navBtns = document.querySelectorAll('.nav-btn');
const tabs = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('page-title');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        tabs.forEach(t => t.classList.remove('active'));

        btn.classList.add('active');
        const target = btn.getAttribute('data-target');
        document.getElementById(target).classList.add('active');
        pageTitle.textContent = btn.textContent.replace(/^[^\w]+/, '');
        loadAllData();
    });
});

// ==========================================
// PERFIL DO BIBLIOTECÁRIO
// ==========================================
const profileForm = document.getElementById('profile-form');

function loadProfile() {
    const lib = getStorage('biblio_librarian', defaultLibrarian);
    document.getElementById('header-librarian-name').textContent = lib.name;
    document.getElementById('prof-name').value = lib.name;
    document.getElementById('prof-user').value = lib.user;
    document.getElementById('prof-pass').value = lib.pass;
}

profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
        name: document.getElementById('prof-name').value,
        user: document.getElementById('prof-user').value,
        pass: document.getElementById('prof-pass').value
    };
    setStorage('biblio_librarian', updated);
    loadProfile();
    alert('Perfil do bibliotecário atualizado com sucesso!');
});

// ==========================================
// CADASTRO DE LIVROS (COM E SEM LEITOR)
// ==========================================
const bookMode = document.getElementById('book-mode');
const barcodeGroup = document.getElementById('barcode-group');
const bookIsbnInput = document.getElementById('book-isbn');
const bookForm = document.getElementById('book-form');

// Alterna visibilidade do campo de código de barras
bookMode.addEventListener('change', () => {
    if (bookMode.value === 'barcode') {
        barcodeGroup.classList.remove('hidden');
        bookIsbnInput.focus();
    } else {
        barcodeGroup.classList.add('hidden');
        bookIsbnInput.value = '';
    }
});

// Leitores de código de barras enviam "Enter" após ler. 
// Isso evita enviar o formulário antes de preencher título e autor.
bookIsbnInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('book-title').focus();
    }
});

bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const mode = bookMode.value;
    let code = bookIsbnInput.value.trim();

    if (mode === 'manual' || !code) {
        // Gera código interno automático caso não use leitor
        code = 'INT-' + Math.floor(100000 + Math.random() * 900000);
    }

    const newBook = {
        id: Date.now().toString(),
        code: code,
        title: document.getElementById('book-title').value,
        author: document.getElementById('book-author').value,
        qty: parseInt(document.getElementById('book-qty').value)
    };

    books.push(newBook);
    setStorage('biblio_books', books);
    bookForm.reset();
    barcodeGroup.classList.remove('hidden');
    loadAllData();
    alert('Livro cadastrado com sucesso!');
});

function deleteBook(id) {
    if (confirm('Deseja excluir este livro do acervo?')) {
        books = books.filter(b => b.id !== id);
        setStorage('biblio_books', books);
        loadAllData();
    }
}

function renderBooks() {
    const tbody = document.getElementById('books-table-body');
    tbody.innerHTML = '';
    books.forEach(book => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${book.code}</strong></td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.qty} un.</td>
                <td>
                    <button class="btn-danger btn-sm" onclick="deleteBook('${book.id}')">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// ==========================================
// USUÁRIOS E CARTEIRINHA
// ==========================================
const userForm = document.getElementById('user-form');

userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newUser = {
        id: Math.floor(1000 + Math.random() * 9000).toString(),
        name: document.getElementById('user-name').value,
        doc: document.getElementById('user-doc').value,
        phone: document.getElementById('user-phone').value
    };

    users.push(newUser);
    setStorage('biblio_users', users);
    userForm.reset();
    loadAllData();
    alert('Usuário cadastrado com sucesso!');
});

function deleteUser(id) {
    if (confirm('Remover este usuário?')) {
        users = users.filter(u => u.id !== id);
        setStorage('biblio_users', users);
        loadAllData();
    }
}

function openCardModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('card-user-name').textContent = user.name;
    document.getElementById('card-user-doc').textContent = user.doc;
    document.getElementById('card-user-phone').textContent = user.phone;
    document.getElementById('card-user-barcode').textContent = `*${user.id}*`;

    document.getElementById('card-modal').classList.remove('hidden');
}

function closeCardModal() {
    document.getElementById('card-modal').classList.add('hidden');
}

function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    users.forEach(u => {
        tbody.innerHTML += `
            <tr>
                <td>#${u.id}</td>
                <td>${u.name}</td>
                <td>${u.doc}</td>
                <td>${u.phone}</td>
                <td>
                    <button class="btn-primary btn-sm" onclick="openCardModal('${u.id}')">🪪 Carteirinha</button>
                    <button class="btn-danger btn-sm" onclick="deleteUser('${u.id}')">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// ==========================================
// EMPRÉSTIMOS, DEVOLUÇÕES E VERIFICAÇÃO DE DATA
// ==========================================
const loanForm = document.getElementById('loan-form');

function populateLoanSelects() {
    const userSelect = document.getElementById('loan-user');
    const bookSelect = document.getElementById('loan-book');

    userSelect.innerHTML = '<option value="">-- Selecione o Leitor --</option>';
    users.forEach(u => {
        userSelect.innerHTML += `<option value="${u.id}">${u.name} (${u.doc})</option>`;
    });

    bookSelect.innerHTML = '<option value="">-- Selecione o Livro --</option>';
    books.filter(b => b.qty > 0).forEach(b => {
        bookSelect.innerHTML += `<option value="${b.id}">[${b.code}] ${b.title} (${b.qty} disp.)</option>`;
    });

    // Sugere data de devolução padrão para +7 dias
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.getElementById('loan-return-date').value = nextWeek.toISOString().split('T')[0];
}

loanForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userId = document.getElementById('loan-user').value;
    const bookId = document.getElementById('loan-book').value;
    const returnDate = document.getElementById('loan-return-date').value;

    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1 || books[bookIndex].qty <= 0) {
        alert('Livro indisponível no momento.');
        return;
    }

    // Baixa no estoque
    books[bookIndex].qty -= 1;
    setStorage('biblio_books', books);

    const newLoan = {
        id: Date.now().toString(),
        userId: userId,
        bookId: bookId,
        loanDate: new Date().toISOString().split('T')[0],
        returnDate: returnDate,
        returned: false
    };

    loans.push(newLoan);
    setStorage('biblio_loans', loans);
    loadAllData();
    alert('Empréstimo registrado!');
});

function returnBook(loanId) {
    const loanIndex = loans.findIndex(l => l.id === loanId);
    if (loanIndex === -1) return;

    loans[loanIndex].returned = true;
    setStorage('biblio_loans', loans);

    // Devolve exemplar ao estoque
    const bookIndex = books.findIndex(b => b.id === loans[loanIndex].bookId);
    if (bookIndex !== -1) {
        books[bookIndex].qty += 1;
        setStorage('biblio_books', books);
    }

    loadAllData();
    alert('Livro devolvido com sucesso!');
}

function checkOverdue(returnDateStr) {
    const today = new Date().toISOString().split('T')[0];
    return returnDateStr < today;
}

function formatDateBR(dateStr) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

function renderLoans() {
    const tbody = document.getElementById('loans-table-body');
    tbody.innerHTML = '';

    loans.forEach(loan => {
        const user = users.find(u => u.id === loan.userId) || { name: 'Usuário Removido' };
        const book = books.find(b => b.id === loan.bookId) || { title: 'Livro Removido' };
        const isLate = !loan.returned && checkOverdue(loan.returnDate);

        let statusBadge = '';
        if (loan.returned) {
            statusBadge = '<span class="badge badge-returned">Devolvido</span>';
        } else if (isLate) {
            statusBadge = '<span class="badge badge-late">ATRASADO</span>';
        } else {
            statusBadge = '<span class="badge badge-ok">No Prazo</span>';
        }

        tbody.innerHTML += `
            <tr>
                <td>${user.name}</td>
                <td>${book.title}</td>
                <td>${formatDateBR(loan.loanDate)}</td>
                <td><strong>${formatDateBR(loan.returnDate)}</strong></td>
                <td>${statusBadge}</td>
                <td>
                    ${!loan.returned 
                        ? `<button class="btn-success btn-sm" onclick="returnBook('${loan.id}')">Registrar Devolução</button>` 
                        : '---'}
                </td>
            </tr>
        `;
    });
}

// ==========================================
// PAINEL ADMINISTRATIVO (ESTATÍSTICAS E ALERTAS)
// ==========================================
function renderDashboard() {
    const totalBooks = books.reduce((sum, b) => sum + b.qty, 0);
    const activeLoans = loans.filter(l => !l.returned);
    const overdueLoans = activeLoans.filter(l => checkOverdue(l.returnDate));
    const today = new Date().toISOString().split('T')[0];

    document.getElementById('stat-books').textContent = totalBooks;
    document.getElementById('stat-users').textContent = users.length;
    document.getElementById('stat-loans').textContent = activeLoans.length;
    document.getElementById('stat-overdue').textContent = overdueLoans.length;

    const alertsBody = document.getElementById('alerts-table-body');
    alertsBody.innerHTML = '';

    const criticalLoans = activeLoans.filter(l => l.returnDate <= today);

    if (criticalLoans.length === 0) {
        alertsBody.innerHTML = '<tr><td colspan="4">Nenhum livro atrasado ou vencendo hoje.</td></tr>';
        return;
    }

    criticalLoans.forEach(loan => {
        const user = users.find(u => u.id === loan.userId) || { name: 'Desconhecido' };
        const book = books.find(b => b.id === loan.bookId) || { title: 'Desconhecido' };
        const isLate = loan.returnDate < today;

        alertsBody.innerHTML += `
            <tr>
                <td>${book.title}</td>
                <td>${user.name}</td>
                <td>${formatDateBR(loan.returnDate)}</td>
                <td>
                    <span class="badge ${isLate ? 'badge-late' : 'badge-ok'}">
                        ${isLate ? 'ATRASADO' : 'VENCE HOJE'}
                    </span>
                </td>
            </tr>
        `;
    });
}

// ==========================================
// CARREGAMENTO GERAL
// ==========================================
function loadAllData() {
    loadProfile();
    renderBooks();
    renderUsers();
    populateLoanSelects();
    renderLoans();
    renderDashboard();
}

// Inicia verificação de login ao abrir a página
checkAuth();
