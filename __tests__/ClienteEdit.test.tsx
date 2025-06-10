import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import EditarClientePage from '@/app/dashboard/clientes/[id]/page'
import * as clientService from '@/services/clients'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('EditarClientePage', () => {
  const fakeClient = {
    id: 'abc123',
    name: 'Fulano',
    email: 'fulano@mail.com',
    phone: '999999999',
  }

  const pushMock = jest.fn()

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock })
    jest.spyOn(clientService, 'getClientById').mockResolvedValue(fakeClient)
    jest.spyOn(clientService, 'updateClient').mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('deve carregar dados do cliente e preencher o formulário', async () => {
    render(<EditarClientePage params={{ id: fakeClient.id }} />)

    expect(screen.getByText(/Carregando cliente.../i)).toBeInTheDocument()

    await waitFor(() => expect(clientService.getClientById).toHaveBeenCalledWith(fakeClient.id))

    expect(screen.getByLabelText(/Nome/i)).toHaveValue(fakeClient.name)
    expect(screen.getByLabelText(/Email/i)).toHaveValue(fakeClient.email)
    expect(screen.getByLabelText(/Telefone/i)).toHaveValue(fakeClient.phone)
  })

  it('deve atualizar os dados e redirecionar após salvar', async () => {
    render(<EditarClientePage params={{ id: fakeClient.id }} />)
    await waitFor(() => screen.getByLabelText(/Nome/i))

    fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: 'Novo Nome' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'novo@mail.com' } })
    fireEvent.change(screen.getByLabelText(/Telefone/i), { target: { value: '123456789' } })

    fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }))

    await waitFor(() => expect(clientService.updateClient).toHaveBeenCalledWith(fakeClient.id, {
      name: 'Novo Nome',
      email: 'novo@mail.com',
      phone: '123456789',
    }))

    expect(pushMock).toHaveBeenCalledWith('/dashboard/clientes')
  })

  it('deve mostrar alerta em caso de erro no carregamento', async () => {
    jest.spyOn(clientService, 'getClientById').mockRejectedValueOnce(new Error('Erro'))

    window.alert = jest.fn()
    render(<EditarClientePage params={{ id: 'wrong-id' }} />)

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Erro ao carregar cliente'))
    expect(pushMock).toHaveBeenCalledWith('/dashboard/clientes')
  })

  it('deve mostrar alerta em caso de erro no update', async () => {
    jest.spyOn(clientService, 'updateClient').mockRejectedValueOnce(new Error('Erro update'))

    window.alert = jest.fn()
    render(<EditarClientePage params={{ id: fakeClient.id }} />)
    await waitFor(() => screen.getByLabelText(/Nome/i))

    fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }))

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Erro ao atualizar cliente'))
  })
})
