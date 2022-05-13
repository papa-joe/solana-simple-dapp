# ovie_top_tuples

## THE PROBLEM
Let's say you have to keep the largest (top) N tuples where a tuple with the larger first element is defined as the larger tuple. The list of top tuples needs to be changed as a new tuple is provided. Let's say N is 2 and (1,1) , (1,2) and, (1, 3) are given. Then the top tuple list should consist of (1,2) and (1,3). When (2, 1) is newly given, the list is updated to consist of (1,3) and (2,1).  The list needs not be ordered.

### HOW TO KNOW WHICH TUPLE IS BIGGER
1. A tuple X contains two elements and both of the elements are type of 64bit unsigned integer.
2. A tuple X is larger than a tuple Y, if X’s 1st element is larger than Y’s 1st element.
3. A tuple X is larger than a tuple Y, if X’s n-th element is larger than Y’s n-th element and all elements before n-th element have same value between two tuples.
4. A tuple X is n-th largest in a set of tuples T, if and only if (n-1) number of tuples larger than X

## TO SETUP THIS PROJECT

### LETS START WITH THE SOLANA PROGRAM

note: to run this program on your machine you have to have rust, solana and anchor setup on your local machine, check https://book.anchor-lang.com/getting_started/installation.html on how to install them all.

When you are done clone the repo then cd into mycooldapp and run

```
npm install
```

Direct your network to devnet network using

```
solana config set --url devnet
solana config get
```

test the program on devnet by running

```
anchor test
```

## THE CODE

### add_tup

Let's break down the code in the add_tup function.

```rust
pub fn add_tup(ctx: Context<AddTup>, tup: String) -> Result <()> {
    let base_account = &mut ctx.accounts.base_account;
    let _user = &mut ctx.accounts.user;

    let r = &tup;
```

This function takes in our 2 numbers separated by ',' then transfers it as reference to variable r

```rust
    let mut tup_elements = vec![];
    let single_tup_elements = r.split(",");
    for x in single_tup_elements {
        tup_elements.push(x);
    }

    // check if string is enough to represent two 64bit unsigned integer values
    
    base_account.tup_list.push("1,2".to_string());
    base_account.tup_list.push("7,3".to_string());
    base_account.tup_list.push("1,4".to_string());
		
	// Add it to the tup vector.
    if base_account.tup_list.len() < 3 {
        base_account.tup_list.push(r.to_string());
    }
```

Here i created an empty vector called tup_elements to store each number in our string after splitting it.

Then i added 3 elements to our tup_list for testing purposes, the last portion of this block deals with the actual adding of element passed into the function. Here we are assuming that our tuple_list should hold a maximum of 3 elements, you can change the number from 3 to what you want and add as much test element. When we deploy to devnet and connect to a frontend we will remove those test data.

```rust
    if base_account.tup_list.len() >= 3 {
        for i in 0..base_account.tup_list.len() {
            
            let mut tuplist_elements = vec![];
            let single_tuplist_elements = base_account.tup_list[i].split(",");
            for s in single_tuplist_elements {
                tuplist_elements.push(s);
            }

            let tuplist_element_int: u64 = tuplist_elements[0].parse().unwrap();
            let tup_elements_int: u64 = tup_elements[0].parse().unwrap();
            let second_tuplist_element_int: u64 = tuplist_elements[1].parse().unwrap();
            let second_tup_elements_int: u64 = tup_elements[1].parse().unwrap();            

            if (tuplist_element_int < tup_elements_int) || (second_tuplist_element_int < second_tup_elements_int) {
                base_account.tup_list.push(r.to_string());
                break;
            }
        }
    }
```

we want to keep only n largest elements(in this case 3), so we check if the tup_list is up to 3 elements, if it is then we want to compare all the elements in the tup_list with the element submited, if we find any element in the tup_list that is smaller than the submited element it means that the submited element can go into the tup_list, so we push the element into the tup_list which increases the tup_list length to 4.

```rust
    for i in 0..base_account.tup_list.len() {
        for j in 0..base_account.tup_list.len() - 1 - i {
            let mut tuplist_elements = vec![];
            let mut tuplist_elements_step = vec![];
            let single_tuplist_elements = base_account.tup_list[j].split(",");
            let splitt = base_account.tup_list[j + 1].split(",");
            for s in single_tuplist_elements {
                tuplist_elements.push(s);
            }

            for ss in splitt {
                tuplist_elements_step.push(ss);
            }
            let tuplist_element_int: u64 = tuplist_elements[0].parse().unwrap();
            let tup_elements_int: u64 = tuplist_elements_step[0].parse().unwrap();
            let second_tuplist_element_int: u64 = tuplist_elements[1].parse().unwrap();
            let second_tup_elements_int: u64 = tuplist_elements_step[1].parse().unwrap(); 
            if tup_elements_int > tuplist_element_int {
                base_account.tup_list.swap(j, j + 1);
            }else if tup_elements_int == tuplist_element_int {
                if second_tup_elements_int > second_tuplist_element_int {
                    base_account.tup_list.swap(j, j + 1);
                }
            }
        }
    }
```

Time for some bubble sort, anytime we add a new element to the tup_list we want to sort it in descending order, this will help us later to easily get the i-th largest tuple. A better way to implement this will be to create a new funtion and call it inside this one. 

```rust
    if base_account.tup_list.len() >= 3 {
        base_account.tup_list.remove(3);
    }
    
    Ok(())
```

this last part of this function is to reduce our tup_list back to our desired length by simply removing the last element (which will be the smallest element) thereby keeping the largest (top) N elements. The code can be improved to check for max element in tup_list just once.

### get_tup

Let's break down the code in the get_tup function.

```rust
pub fn get_tup(ctx: Context<GetTup>, tup_index: i32) -> Result <()> {
    let base_account = &mut ctx.accounts.base_account;
    let _user = &mut ctx.accounts.user;

    let num_usize: usize = tup_index as usize;
```

The get_tup function receives an i-th i32 value to represent an index, we convert the i32 value to usize for indexing vectors

```rust
require!(num_usize <= base_account.tup_list.len(), MyError::IndexTooLarge);
```

```rust
#[error_code]
pub enum MyError {
    #[msg("Out of bound")]
    IndexTooLarge
}
```

The require block of code helps us check that the index provided is not larger than the length of the tup_list vector, if it is, an error is thrown

```rust
for i in 0..base_account.tup_list.len() {
        if i == num_usize - 1 {
            {
                let b = base_account.clone();
                let fd = &b.tup_list[i];
                base_account.zanga.clear();
                base_account.zanga.push(fd.to_string());
            }
        }
    }
```

Here we do a simple loop through the tup_list to get the element at the index that was submited, because we already bubble sorted the tup_list on insertion, this process is easier, but you could also skip the sorting on insertion and do it here first instead before getting the element. lets not forget to empty the zanga first before inserting the i-th largest element

### LET'S SETUP THE CLIENT SIDE

cd in to client and run 

```
npm install
```

```
npm start
```

![Alt text](client/src/assets/client.png?raw=true "Title")