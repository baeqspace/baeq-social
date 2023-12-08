

-- @block

drop table AvitoItems;

create table AvitoItems (
    id bigint(20),
    itemName varchar(255),
    price int,
    startTime int,
    itemLocation varchar(255),
    photos varchar(1000),
    avitoLink varchar(500)
);


-- @block

insert into AvitoItems (ItemName, Price, StartTime, ItemLocation, PhotosID, AvitoLink)
values ('name', 1, 1, 'location', 2, 'link');

-- @block

insert into Photos (ItemID, PhotoLink)
values (2, 'test'), (2, 'sample');


-- @block
select * from AvitoItems


-- @block
select a.ItemName, a.Price, a.StartTime, a.ItemLocation, a.AvitoLink, p.ItemID, group_concat(p.PhotoLink) as PhotoLinks from AvitoItems as a
join Photos as p
on a.PhotosID = p.ItemID
group by a.ItemName, a.Price, a.StartTime, a.ItemLocation, a.AvitoLink, p.ItemID


-- @block
alter table AvitoItems
rename column AvitoLink to avitoLink