es Lint is basically a program that 
constantly scans our code
and finds potential coding errors
or simply bad coding practices that it thinks are wrong.

It's very, very configurable so that

we can really fine tune it to our needs,

and coding habits


npm install and we need to

also install es Lint in prettier as npm packages.

Okay?

So es Lint and prettier,

and probably this is now the first time

where we are actually installing

multiple packages at the same time.

And so that's very easy, we simply write

all these packages all in the same command.

Okay?

But with these two we are actually far from ready.

So the next one is es Lint config prettier

and this one will disable formatting for es Lint,

because remember, we want prettier to format our code.

Next up we have es Lint plugin prettier

and this one will allow es Lint

to show formatting errors as we type,

again, using prettier.

Okay?

And all of this is of course, very confusing

and I needed a lot of time to figure this out.

And so this really is just a recipe

that you need to follow here.

 there are many style guides out there,

but the most popular one

is probably the airbnb style guide.

And so actually, there is an es Lint configuration

that we can use for that, which is on npm,

and it's called eslint config airbnb.

npm i 
eslint prettier 
eslint-config-prettier 
eslint-plugin-prettier 
eslint-config-airbnb 
eslint-plugin-node 
eslint-plugin-import 
eslint-plugin-jsx-a11y 
eslint-plugin-react --save-dev