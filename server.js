const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
// create a server 
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// this connects express to mysql
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'iwantin',
    database: 'employee_data'
  },
);

const initialQuestion = () => {
  inquirer.prompt([
  {
      type: 'list',
      message: 'What would you like to do?',
      choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
      name: 'init',
  }
]).then(({init}) => {
    switch (init) {
      case 'View All Employees':
        allEmployees()
      break;
      case 'Add Employee':
        addEmployee()
      break;
      case 'Update Employee Role':
        updateEmloyeeRole()
      break;
      case 'View All Roles':
        viewAllRoles()
      break;
      case 'Add Role':
        addRole()
      break;
      case 'View All Departments':
        viewAllDepartment()
      break;
      case 'Add Department':
        addDepartment()
      break;
      case 'Quit':
        console.log('Done')
      break;
    }}
  )
}

initialQuestion()

//  SELECT employee.first_name + ' ' + employee.last_name FROM employee INNER JOIN 
// , CONCAT(employee.first_name, employee.last_name) AS manager FROM employees
// SELECT employee.first_name, employee.last_name FROM employee UNION SELECT employee.manager_id FROM employee
// INNER JOIN employee ON employee.manager_id <> employee.first_name, employee.last_name
// SELECT employee.manager_id FROM employee WHERE employee.manager_id <> employee.id
// need to work on te join function 
const allEmployees = () => {
  db.query(`SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS Name, role_types.title AS Title, role_types.salary AS Salary, department.dep_name AS Department, employee.manager_id AS Manager FROM department INNER JOIN role_types ON role_types.department_id = department.id INNER JOIN employee ON role_types.id = employee.role_id`, function (err, results) {
  console.table(results);
  initialQuestion()
  })
}

const addEmployee = () => {
  inquirer.prompt([
   {
      type: 'input',
      message: 'What is their first name?',
      name: 'firstName',
    },
    {
    type: 'input',
    message: 'What is their last name?',
    name: 'lastName',
    },
    {
    type: 'list',
    message: 'What is their role?',
    choices: ['Sales Lead', 'Salesperson', 'Lead Engineer', 'Software Engineer', 'Account Manager', 'Accountant', 'Legal Team Lead', 'Lawyer'],
    name: 'employeeRole',
    },
    {
      type: 'input',
      message: 'Who is their manager?',
      name: 'employeeManager',
    },
  ]).then (({firstName,lastName,employeeRole,employeeManager}) => {
    console.log(firstName,lastName,employeeRole,employeeManager)
    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (${firstName}, ${lastName}, ${employeeRole}, ${employeeManager})`, function (err, results) {
      console.table(results)
    // console.log(results)
    initialQuestion()
  })
})}

const updateEmloyeeRole = () => {
  // collects employees from the database
    const getEmployees = () => {
    return new Promise((res, rej) => {
      db.query(`SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS Name FROM employee`, (err,res) => {
        console.log(res)
      })
    })
  }
  const employeesToUpdate = getEmployees()
  console.log(employeesToUpdate)
  return new Promise((res,rej) => {
    inquirer.prompt({
      type: 'list',
      message: 'Select employee.',
      choices: [employeesToUpdate],
      name: 'employeesToUpdateQuestion',
    })
  })
}

const viewAllRoles = async () => {
  db.query('SELECT role_types.id AS Role ID, role_types.title AS Title, role_types.salary AS Salary, department.dep_name AS Department FROM department INNER JOIN role_types ON role_types.department_id = department.id', function (err, results) {
    console.table(results)
    initialQuestion()
  })
}

const addRole = () => {
  inquirer.prompt([
    {
       type: 'input',
       message: 'What is the role title?',
       name: 'roleTitle',
     },
     {
     type: 'input',
     message: 'What is the role salary?',
     name: 'roleSalary',
     },
     {
     type: 'list',
     message: 'What is the role department?',
     choices: ['Engineering', 'Finance', 'Legal', 'Sales'],
     name: 'roleDepartment',
     },
 
   ]).then (({roleTitle,roleSalary,roleDepartment}) => {
     db.query(`INSERT INTO role_types (title, salary, department_id) VALUES (${roleTitle}, ${roleSalary}, ${roleDepartment})`, function (err, results) {
       console.table(results)
     // console.log(results)
     initialQuestion()
   })
 })}

const viewAllDepartment = () => {
  db.query('SELECT department.id AS Department ID, department.dep_name AS Department Name FROM department', function (err, results) {
    console.table(results)
    initialQuestion()
  })
}

const addDepartment = () => {
  inquirer.prompt([
    {
       type: 'input',
       message: 'What is the department title?',
       name: 'departmentTitle',
     },
   ]).then (({departmentTitle}) => {
     db.query(`INSERT INTO role_types (dep_name) VALUES (${departmentTitle})`, function (err, results) {
       console.table(results)
     // console.log(results)
     initialQuestion()
   })
 })}

app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});