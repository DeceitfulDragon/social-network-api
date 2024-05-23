const connection = require('./config/connection');
const { User, Thought } = require('./models');

const users = [
  {
    username: 'john_doe',
    email: 'johndoe@example.com',
    thoughts: [],
    friends: []
  },
  {
    username: 'jane_smith',
    email: 'janesmith@example.com',
    thoughts: [],
    friends: []
  },
  {
    username: 'my_man',
    email: 'myman@example.com',
    thoughts: [],
    friends: []
  },
  {
    username: 'my_guy',
    email: 'myguy@example.com',
    thoughts: [],
    friends: []
  }
];

const thoughts = [
  {
    thoughtText: 'This is a thought from john_doe',
    username: 'john_doe',
    reactions: [
      {
        reactionBody: 'This is a reaction to john_doe\'s thought',
        username: 'jane_smith'
      }
    ]
  },
  {
    thoughtText: 'This is another thought from jane_smith',
    username: 'jane_smith',
    reactions: [
      {
        reactionBody: 'This is a reaction to jane_smith\'s thought',
        username: 'john_doe'
      }
    ]
  }
];

connection.on('error', (err) => err);

connection.once('open', async () => {
  console.log('connected');

  // Delete existing users and thoughts
  await User.deleteMany({});
  await Thought.deleteMany({});

  // Insert users
  const createdUsers = await User.insertMany(users);
  console.log('Users seeded');

  // Insert thoughts and connect them to my users
  for (let thought of thoughts) {
    const createdThought = await Thought.create(thought);
    await User.updateOne(
      { username: createdThought.username },
      { $push: { thoughts: createdThought._id } }
    );
  }
  console.log('Thoughts seeded');

  // Update user friends
  await User.updateOne(
    { username: 'john_doe' },
    { $addToSet: { friends: createdUsers.find(user => user.username === 'jane_smith')._id } }
  );
  await User.updateOne(
    { username: 'jane_smith' },
    { $addToSet: { friends: createdUsers.find(user => user.username === 'john_doe')._id } }
  );

  console.log('Friends updated');
  process.exit(0);
});