import { Link } from '@inertiajs/react';
import { Add } from '@mui/icons-material';
import { Button, Card, CardActions, CardContent, Container, Typography } from '@mui/material';
import React, { useState } from 'react';

const Test = ({ auth, date }) => {
    const [count, setCount] = useState(0);
    return (
        <Container sx={{ width: 'fit-content', padding: 4 }}>
            <Card elevation={4}>
                <CardContent>
                    <Typography variant='h5' fontWeight={600}>
                        Hello! {auth.user ? `How's your day ${auth.user.name}?` : <Link href={route("login")}>Lets Login!</Link>}
                    </Typography>
                    <Typography variant='h5'>
                        This is a test component with MUI!
                    </Typography>
                    <Typography variant='h5'>
                        Date from Laravel: {date}
                    </Typography>
                    {
                        count ?
                            <Typography variant='h3'>
                                Count: {count}
                            </Typography> : null
                    }
                </CardContent>
                <CardActions sx={{ padding: 2 }}>
                    <Button variant='contained' onClick={() => alert("Clicked")}>Click!</Button>
                    <Button onClick={() => setCount(count + 1)}><Add /></Button>
                </CardActions>
            </Card>

        </Container>
    )
}

export default Test 