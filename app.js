//jshint esversion:6

const express = require("express")
const bodyParser = require("body-parser")
const date = require(__dirname + '/date.js')
const year = date.getYear()
const mongoose = require('mongoose')
const _ = require('lodash')

const app = express()

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))

mongoose.set('strictQuery', false)
mongoose.connect('mongodb+srv://admin-hadi:178010Atlas@cluster0.ouzmlbq.mongodb.net/todolistDB')

const itemsSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: [true, 'Please enter item name. No name specified.']
  }
})

const Item = mongoose.model('Item', itemsSchema)

const item1 = new Item ({
  name: 'Welcome to your todolist!'
})
const item2 = new Item ({
  name: 'Hit the + button to add a new item.'
})
const item3 = new Item ({
  name: '<-- Hit this to delete an item.>'
})

const defaultItems = [item1, item2, item3]

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter List name. No name specified.']
  },
  items: [itemsSchema]
})

const List = mongoose.model('List', listSchema)



app.get("/", function(req, res) {

  Item.find(function(err, foundItems) {
    if (err) {
      console.log(err)
    } else {
      if (foundItems === 0) {
        Item.insertMany(defaultItems, (err) => {
          if (err) {
            console.log(err)
          } else {
            console.log('Default items successfully saved to database.')
          }
        })
        res.redirect('/')
      } else {
        res.render("list", {year: year, listTitle: "Today", newListItems: foundItems})
      }      
    }
  })

})

app.get('/:customListName', (req, res) => {
  const requestedListName = _.lowerCase(req.params.customListName)
  if (requestedListName === 'home') {
    res.redirect('/')
  } else {
    // create or find the items in database as requested from user by typing the todolist page
    List.findOne({name: requestedListName}, (err, foundList) => {
      if (!err) {
        if (!foundList) {
          const list = new List({
            name: requestedListName,
            items: defaultItems
          })
          list.save()
          res.redirect(`/${requestedListName}`)
        } else {
          res.render('list', {
            year: year,
            listTitle: _.upperFirst(foundList.name),
            newListItems: foundList.items
          })
        }
      }
    }) 
  }
})

app.post("/", function(req, res){

  const itemName = req.body.newItem
  const listName = _.lowerCase(req.body.list)

  const item = new Item ({
    name: itemName
  })

  if (listName === 'today') {
    item.save()
    console.log(`Successfully added '${item.name}' to 'Today' ToDoList!`)
    res.redirect('/')
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      if (err) {
        console.log(err)
      } else {
        // console.log(foundList)
        foundList.items.push(item)
        foundList.save()
        console.log(`Successfully added '${item.name}' to '${_.capitalize(foundList.name)}' ToDoList!`)
        res.redirect(`/${listName}`)
      }
    })
  }
})

app.post('/delete', (req, res) => {
  // console.log(req.body)
  const checkedItemId = req.body.checkbox
  const checkedItemList = _.lowerCase(req.body.listName)
  if (checkedItemList === 'today') {
    Item.findByIdAndRemove(checkedItemId, (err, item) =>{
      if (err) {
        console.log(err)
      } else {
        console.log(`Successfully delete '${item.name}' from 'Today' Todolist.`)
      }
    })
    res.redirect('/')
  } else {
    List.findOneAndUpdate({name: checkedItemList}, {$pull: {items: {_id: checkedItemId}}}, (err, foundItem) => {
      if (err) {
        console.log(err)
      } else {
        let itemToDelete = foundItem.items.find( x => x.id === checkedItemId).name
        // console.log(foundItem)
        console.log(`Successfully delete '${itemToDelete}' from '${_.capitalize(checkedItemList)}' Todolist.`)
        res.redirect(`/${checkedItemList}`)
      }
    })
  }  
})

app.get("/about", function(req, res){
  res.render("about")
})

app.listen(3000, function() {
  console.log("Server started on port 3000")
})
